import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from 'src/entities/book.entity';
import { Rental } from 'src/entities/rental.entity';
import { Store } from 'src/entities/store.entity';
import { DataSource, In, Not, Repository } from 'typeorm';
import { Delivery } from 'src/entities/delivery.entity';
import { DeliveryStatus } from 'src/common/enum/delivery/delivery-status.enum';
import { Notification } from 'src/entities/notification.entity';
import { NotificationStatus } from 'src/common/enum/notification/notification-status.enum';
import { NotificationType } from 'src/common/enum/notification/notification-type.enum';
import { BookStatus } from 'src/common/enum/book/book-status.enum';
import { PaymentStatus } from 'src/common/enum/payment/payment-status.enum';
import { RentalStatus } from 'src/common/enum/user/rental-status.enum';
import { UserRole } from 'src/common/enum/user/user-role.enum';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const RESERVED_RENTAL_STATUSES = [
  RentalStatus.PENDING,
  RentalStatus.APPROVED,
  RentalStatus.ACTIVE,
  RentalStatus.OVERDUE,
];

function parseDateOnly(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : date;
}

@Injectable()
export class RentalService {
  constructor(
    @InjectRepository(Rental)
    private readonly rentalRepository: Repository<Rental>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly dataSource: DataSource,
  ) {}

  async createRequest(
    bookId: string,
    renterId: string,
    rentalStartDate: string,
    rentalDueDate: string,
    timezoneOffsetMinutes: number,
  ): Promise<Rental> {
    const startDate = parseDateOnly(rentalStartDate);
    const dueDate = parseDateOnly(rentalDueDate);
    if (
      !startDate ||
      !dueDate ||
      !Number.isInteger(timezoneOffsetMinutes) ||
      Math.abs(timezoneOffsetMinutes) > 14 * 60
    ) {
      throw new BadRequestException('Rental dates are invalid');
    }

    const localToday = new Date(Date.now() - timezoneOffsetMinutes * 60_000)
      .toISOString()
      .slice(0, 10);
    if (
      rentalStartDate < localToday ||
      rentalDueDate <= rentalStartDate
    ) {
      throw new BadRequestException('Rental dates are invalid');
    }

    return this.dataSource.transaction(async (manager) => {
      const book = await manager.getRepository(Book).findOne({
        where: { id: bookId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!book) {
        throw new NotFoundException(`Book with ID ${bookId} not found`);
      }
      if (book.owner_id === renterId) {
        throw new BadRequestException('You cannot rent your own book');
      }
      if (!book.store_id) {
        throw new BadRequestException('Book is not assigned to a store');
      }
      if (book.status !== BookStatus.AVAILABLE || book.copies < 1) {
        throw new BadRequestException('Book is not available for rental');
      }
      const reservedCopies = await manager.getRepository(Rental).countBy({
        book_id: bookId,
        status: In(RESERVED_RENTAL_STATUSES),
      });
      if (reservedCopies >= book.copies) {
        throw new BadRequestException(
          'All copies of this book are already requested or rented',
        );
      }

      const rentalDays =
        (dueDate.getTime() - startDate.getTime()) / MILLISECONDS_PER_DAY;
      const rental = manager.getRepository(Rental).create({
        book_id: book.id,
        renter_id: renterId,
        store_id: book.store_id,
        rental_start_date: startDate,
        rental_due_date: dueDate,
        status: RentalStatus.PENDING,
        total_amount: Number(book.rental_price_per_day) * rentalDays,
        payment_status: PaymentStatus.PENDING,
        late_fee_paid: false,
      });
      return manager.getRepository(Rental).save(rental);
    });
  }

  async getRequest(
    rentalId: string,
    userId: string,
    userRole: string,
  ): Promise<Rental> {
    const rental = await this.rentalRepository.findOne({
      where: { id: rentalId },
      relations: { book: true, store: true },
    });
    if (!rental) {
      throw new NotFoundException(`Rental request with ID ${rentalId} not found`);
    }

    if (
      userRole !== UserRole.ADMIN &&
      rental.renter_id !== userId &&
      rental.book.owner_id !== userId &&
      rental.store.store_manager_id !== userId
    ) {
      throw new ForbiddenException('You cannot view this rental request');
    }
    return rental;
  }

  async getUserRentals(userId: string): Promise<Rental[]> {
    return this.rentalRepository.find({
      where: { renter_id: userId },
      relations: { book: true, store: true },
      order: { created_at: 'DESC' },
    });
  }

  async getStoreRentalRequests(
    managerId: string,
    managerRole: string,
  ): Promise<Rental[]> {
    if (managerRole !== UserRole.STORE_MANAGER) {
      throw new ForbiddenException('Only store managers can view store rental requests');
    }

    const stores = await this.storeRepository.find({
      where: { store_manager_id: managerId },
      select: { id: true },
    });
    const storeIds = stores.map(({ id }) => id);
    if (!storeIds.length) {
      return [];
    }

    return this.rentalRepository.find({
      where: { store_id: In(storeIds), status: RentalStatus.PENDING },
      relations: { book: true, renter: true, store: true },
      order: { created_at: 'DESC' },
    });
  }

  async approveRequest(
    rentalId: string,
    managerId: string,
    managerRole: string,
  ): Promise<Rental> {
    const rental = await this.findRental(rentalId);
    await this.assertStoreManager(rental, managerId, managerRole);
    this.assertStatus(rental, RentalStatus.PENDING);

    const book = await this.findBook(rental.book_id);
    if (book.status !== BookStatus.AVAILABLE || book.copies < 1) {
      throw new BadRequestException('Book is no longer available for rental');
    }
    rental.status = RentalStatus.APPROVED;
    const approvedRental = await this.rentalRepository.save(rental);
    await this.notificationRepository.save({
      user_id: rental.renter_id,
      message: 'Your rental request was approved.',
      type: NotificationType.RENTAL_APPROVED,
      status: NotificationStatus.UNREAD,
    });
    return approvedRental;
  }

  async rejectRequest(
    rentalId: string,
    managerId: string,
    managerRole: string,
  ): Promise<Rental> {
    const rental = await this.findRental(rentalId);
    await this.assertStoreManager(rental, managerId, managerRole);
    this.assertStatus(rental, RentalStatus.PENDING);

    rental.status = RentalStatus.REJECTED;
    return this.rentalRepository.save(rental);
  }

  async checkout(rentalId: string, renterId: string): Promise<Rental> {
    return this.dataSource.transaction(async (manager) => {
      const rentals = manager.getRepository(Rental);
      const rental = await rentals.findOne({
        where: { id: rentalId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!rental) {
        throw new NotFoundException(`Rental request with ID ${rentalId} not found`);
      }
      this.assertRenter(rental, renterId);
      this.assertStatus(rental, RentalStatus.APPROVED);
      if (rental.payment_status !== PaymentStatus.COMPLETED) {
        throw new BadRequestException('Rental must be paid before checkout');
      }

      const books = manager.getRepository(Book);
      const book = await books.findOne({
        where: { id: rental.book_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!book) {
        throw new NotFoundException(`Book with ID ${rental.book_id} not found`);
      }
      if (book.status !== BookStatus.AVAILABLE || book.copies < 1) {
        throw new BadRequestException('Book is no longer available for rental');
      }
      const otherReservations = await rentals.count({
        where: {
          book_id: book.id,
          id: Not(rental.id),
          status: In(RESERVED_RENTAL_STATUSES),
        },
      });
      if (otherReservations >= book.copies) {
        throw new BadRequestException(
          'No unreserved copy is available for this rental',
        );
      }

      const delivery = await manager.getRepository(Delivery).findOneBy({
        rental_id: rental.id,
      });
      if (
        delivery &&
        (delivery.status !== DeliveryStatus.COMPLETED ||
          book.store_id !== delivery.destination_store_id)
      ) {
        throw new BadRequestException(
          'Delivery must arrive at its destination hub before checkout',
        );
      }

      const rentalDuration =
        rental.rental_due_date.getTime() - rental.rental_start_date.getTime();
      const checkoutDate = new Date();
      rental.rental_start_date = checkoutDate;
      rental.rental_due_date = new Date(checkoutDate.getTime() + rentalDuration);
      rental.status = RentalStatus.ACTIVE;

      const checkedOutRental = await rentals.save(rental);
      const checkedOutCopies = await rentals.count({
        where: {
          book_id: book.id,
          status: In([RentalStatus.ACTIVE, RentalStatus.OVERDUE]),
        },
      });
      book.status =
        checkedOutCopies >= book.copies
          ? BookStatus.RENTED
          : BookStatus.AVAILABLE;

      await books.save(book);
      return checkedOutRental;
    });
  }

  async returnBook(
    rentalId: string,
    userId: string,
    userRole: string,
  ): Promise<Rental> {
    return this.dataSource.transaction(async (manager) => {
      const rentals = manager.getRepository(Rental);
      const rental = await rentals.findOne({
        where: { id: rentalId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!rental) {
        throw new NotFoundException(
          `Rental request with ID ${rentalId} not found`,
        );
      }
      const isRenter = rental.renter_id === userId;
      const isStoreManager =
        userRole === UserRole.STORE_MANAGER &&
        (await manager.getRepository(Store).findOneBy({
          id: rental.store_id,
          store_manager_id: userId,
        })) !== null;
      if (!isRenter && !isStoreManager) {
        throw new ForbiddenException('You cannot return this rental');
      }
      if (
        rental.status !== RentalStatus.ACTIVE &&
        rental.status !== RentalStatus.OVERDUE
      ) {
        throw new BadRequestException('Only checked-out books can be returned');
      }

      const books = manager.getRepository(Book);
      const book = await books.findOne({
        where: { id: rental.book_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!book) {
        throw new NotFoundException(`Book with ID ${rental.book_id} not found`);
      }

      const returnDate = new Date();
      const fee = this.calculateFeeForRental(rental, book, returnDate);
      rental.return_date = returnDate;
      rental.status = RentalStatus.RETURNED;
      rental.total_amount = Number(rental.total_amount) + fee;
      rental.late_fee_paid = fee === 0;
      const returnedRental = await rentals.save(rental);

      const checkedOutCopies = await rentals.count({
        where: {
          book_id: book.id,
          status: In([RentalStatus.ACTIVE, RentalStatus.OVERDUE]),
        },
      });
      book.status =
        checkedOutCopies >= book.copies
          ? BookStatus.RENTED
          : BookStatus.AVAILABLE;

      await books.save(book);
      return returnedRental;
    });
  }

  async cancelRequest(rentalId: string, renterId: string): Promise<Rental> {
    const rental = await this.findRental(rentalId);
    this.assertRenter(rental, renterId);
    if (
      rental.status !== RentalStatus.PENDING &&
      rental.status !== RentalStatus.APPROVED
    ) {
      throw new BadRequestException(
        'Only pending or approved requests can be cancelled',
      );
    }
    if (rental.payment_status === PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        'Paid rentals cannot be cancelled directly; contact an administrator about a refund',
      );
    }
    if (await this.deliveryRepository.findOneBy({ rental_id: rentalId })) {
      throw new BadRequestException(
        'A rental cannot be cancelled after its delivery has been requested',
      );
    }

    rental.status = RentalStatus.CANCELLED;
    return this.rentalRepository.save(rental);
  }

  async calculateFee(
    rentalId: string,
    userId: string,
    userRole: string,
    returnDate: Date = new Date(),
  ): Promise<number> {
    const rental = await this.getRequest(rentalId, userId, userRole);
    const book = await this.findBook(rental.book_id);
    const feeDate = new Date(returnDate);
    if (Number.isNaN(feeDate.getTime())) {
      throw new BadRequestException('Return date is invalid');
    }
    return this.calculateFeeForRental(rental, book, feeDate);
  }

  private async findRental(rentalId: string): Promise<Rental> {
    const rental = await this.rentalRepository.findOneBy({ id: rentalId });
    if (!rental) {
      throw new NotFoundException(`Rental request with ID ${rentalId} not found`);
    }
    return rental;
  }

  private async findBook(bookId: string): Promise<Book> {
    const book = await this.bookRepository.findOneBy({ id: bookId });
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }
    return book;
  }

  private assertRenter(rental: Rental, renterId: string): void {
    if (rental.renter_id !== renterId) {
      throw new ForbiddenException('Only the renter can perform this action');
    }
  }

  private async assertStoreManager(
    rental: Rental,
    managerId: string,
    managerRole: string,
  ): Promise<void> {
    if (managerRole !== UserRole.STORE_MANAGER) {
      throw new ForbiddenException(
        'Only this store’s manager can perform this action',
      );
    }

    const storeManager = await this.storeRepository.findOneBy({
      id: rental.store_id,
      store_manager_id: managerId,
    });
    if (!storeManager) {
      throw new ForbiddenException(
        'Only this store’s manager can perform this action',
      );
    }
  }

  private assertStatus(rental: Rental, expectedStatus: RentalStatus): void {
    if (rental.status !== expectedStatus) {
      throw new BadRequestException(
        `Rental request must be ${expectedStatus} to perform this action`,
      );
    }
  }

  private calculateFeeForRental(
    rental: Rental,
    book: Book,
    returnDate: Date,
  ): number {
    const lateMilliseconds =
      returnDate.getTime() - rental.rental_due_date.getTime();
    if (lateMilliseconds <= 0) {
      return 0;
    }

    const lateDays = Math.ceil(lateMilliseconds / MILLISECONDS_PER_DAY);
    const fee = lateDays * Number(book.late_fee_per_day ?? 0);
    return Math.round((fee + Number.EPSILON) * 100) / 100;
  }
}

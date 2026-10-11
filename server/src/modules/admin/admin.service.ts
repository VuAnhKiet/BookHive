import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BookTransferStatus } from '../../common/enum/admin/book-transfer-status.enum';
import { DisputeStatus } from '../../common/enum/admin/dispute-status.enum';
import { BookStatus } from '../../common/enum/book/book-status.enum';
import { UserRole } from '../../common/enum/user/user-role.enum';
import { Book } from '../../entities/book.entity';
import { BookTransfer } from '../../entities/book-transfer.entity';
import { Delivery } from '../../entities/delivery.entity';
import { DeliveryStatus } from '../../common/enum/delivery/delivery-status.enum';
import { DeliveryTracking } from '../../entities/delivery-tracking.entity';
import { Notification } from '../../entities/notification.entity';
import { NotificationStatus } from '../../common/enum/notification/notification-status.enum';
import { NotificationType } from '../../common/enum/notification/notification-type.enum';
import { Dispute } from '../../entities/dispute.entity';
import { Rental } from '../../entities/rental.entity';
import { Store } from '../../entities/store.entity';
import { User } from '../../entities/user.entity';
import { AdminDashboard } from './admin-dashboard.object';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(BookTransfer)
    private readonly transferRepository: Repository<BookTransfer>,
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
    @InjectRepository(Rental)
    private readonly rentalRepository: Repository<Rental>,
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    private readonly dataSource: DataSource,
  ) {}

  async getDashboard(adminRole: string): Promise<AdminDashboard> {
    this.assertAdmin(adminRole);
    const [users, books, pendingBooks, pendingTransfers, openDisputes] =
      await Promise.all([
        this.userRepository.count(),
        this.bookRepository.count(),
        this.bookRepository.count({ where: { status: BookStatus.PENDING_APPROVAL } }),
        this.transferRepository.count({
          where: { status: BookTransferStatus.PENDING },
        }),
        this.disputeRepository.count({ where: { status: DisputeStatus.OPEN } }),
      ]);
    return { users, books, pendingBooks, pendingTransfers, openDisputes };
  }

  async manageUsers(adminRole: string): Promise<User[]> {
    this.assertAdmin(adminRole);
    return this.userRepository.find({ order: { created_at: 'DESC' } });
  }

  async updateUserRole(
    userId: string,
    role: UserRole,
    adminRole: string,
  ): Promise<User> {
    this.assertAdmin(adminRole);
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    user.role = role;
    return this.userRepository.save(user);
  }

  async manageBooks(adminRole: string): Promise<Book[]> {
    this.assertAdmin(adminRole);
    return this.bookRepository.find({
      relations: { owner: true, store: true },
      order: { created_at: 'DESC' },
    });
  }

  async approveBook(bookId: string, adminRole: string): Promise<Book> {
    this.assertAdmin(adminRole);
    const book = await this.findBook(bookId);
    this.assertBookPending(book);
    book.status = BookStatus.AVAILABLE;
    return this.bookRepository.save(book);
  }

  async rejectBook(
    bookId: string,
    adminRole: string,
  ): Promise<Book> {
    this.assertAdmin(adminRole);
    const book = await this.findBook(bookId);
    this.assertBookPending(book);
    book.status = BookStatus.REJECTED;
    return this.bookRepository.save(book);
  }

  async createTransfer(
    bookId: string,
    sourceStoreId: string,
    destinationStoreId: string,
    requesterId: string,
    requesterRole: string,
  ): Promise<BookTransfer> {
    if (sourceStoreId === destinationStoreId) {
      throw new BadRequestException('Source and destination hubs must be different');
    }
    const [book, sourceStore, destinationStore] = await Promise.all([
      this.bookRepository.findOneBy({ id: bookId }),
      this.storeRepository.findOneBy({ id: sourceStoreId }),
      this.storeRepository.findOneBy({ id: destinationStoreId }),
    ]);
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }
    if (!sourceStore) {
      throw new NotFoundException(`Source hub with ID ${sourceStoreId} not found`);
    }
    if (
      requesterRole !== UserRole.ADMIN &&
      sourceStore.store_manager_id !== requesterId
    ) {
      throw new ForbiddenException(
        'Only the source hub manager or an administrator can request a transfer',
      );
    }
    if (!destinationStore) {
      throw new NotFoundException(
        `Destination hub with ID ${destinationStoreId} not found`,
      );
    }
    if (book.store_id !== sourceStoreId || book.status !== BookStatus.AVAILABLE) {
      throw new BadRequestException(
        'Book must be available at the selected source hub',
      );
    }
    return this.dataSource.transaction(async (manager) => {
      const books = manager.getRepository(Book);
      const lockedBook = await books.findOne({
        where: { id: bookId },
        lock: { mode: 'pessimistic_write' },
      });
      if (
        !lockedBook ||
        lockedBook.store_id !== sourceStoreId ||
        lockedBook.status !== BookStatus.AVAILABLE
      ) {
        throw new BadRequestException(
          'Book must be available at the selected source hub',
        );
      }
      if (
        await manager.getRepository(BookTransfer).findOneBy({
          book_id: bookId,
          status: BookTransferStatus.PENDING,
        })
      ) {
        throw new ConflictException('This book already has a pending transfer');
      }

      lockedBook.status = BookStatus.TRANSFERRING;
      await books.save(lockedBook);
      return manager.getRepository(BookTransfer).save({
        book_id: bookId,
        source_store_id: sourceStoreId,
        destination_store_id: destinationStoreId,
        requested_by: requesterId,
        status: BookTransferStatus.PENDING,
        decision_note: null,
        decided_by: null,
        decided_at: null,
      });
    });
  }

  async findTransfers(adminRole: string): Promise<BookTransfer[]> {
    this.assertAdmin(adminRole);
    return this.transferRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async approveTransfer(
    transferId: string,
    adminId: string,
    adminRole: string,
  ): Promise<BookTransfer> {
    this.assertAdmin(adminRole);
    return this.dataSource.transaction(async (manager) => {
      const transfers = manager.getRepository(BookTransfer);
      const books = manager.getRepository(Book);
      const transfer = await transfers.findOne({
        where: { id: transferId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!transfer) {
        throw new NotFoundException(`Transfer with ID ${transferId} not found`);
      }
      if (transfer.status !== BookTransferStatus.PENDING) {
        throw new BadRequestException('Only pending transfers can be approved');
      }

      const book = await books.findOne({
        where: { id: transfer.book_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!book) {
        throw new NotFoundException(`Book with ID ${transfer.book_id} not found`);
      }
      if (
        book.store_id !== transfer.source_store_id ||
        book.status !== BookStatus.TRANSFERRING
      ) {
        throw new BadRequestException(
          'Book is no longer awaiting transfer from the source hub',
        );
      }
      transfer.status = BookTransferStatus.APPROVED;
      transfer.decided_by = adminId;
      transfer.decided_at = new Date();
      await books.save(book);
      await transfers.save(transfer);
      const deliveryRepository = manager.getRepository(Delivery);
      const sourceStore = await manager
        .getRepository(Store)
        .findOneBy({ id: transfer.source_store_id });
      const destinationStore = await manager
        .getRepository(Store)
        .findOneBy({ id: transfer.destination_store_id });
      if (!sourceStore || !destinationStore) {
        throw new NotFoundException('Source or destination hub no longer exists');
      }
      const delivery = await deliveryRepository.save(
        deliveryRepository.create({
          book_id: book.id,
          rental_id: null,
          transfer_id: transfer.id,
          requester_id: transfer.requested_by,
          store_id: transfer.source_store_id,
          destination_store_id: transfer.destination_store_id,
          pickup_location: sourceStore.location,
          delivery_location: destinationStore.location,
          status: DeliveryStatus.REQUESTED,
          route_id: null,
          volunteer_id: null,
          handover_at: null,
          completed_at: null,
        }),
      );
      await manager.getRepository(DeliveryTracking).save({
        delivery_id: delivery.id,
        status: delivery.status,
        location: delivery.pickup_location,
        note: 'Hub transfer approved and awaiting volunteer route assignment',
        updated_by: adminId,
      });
      await manager.getRepository(Notification).save({
        user_id: transfer.requested_by,
        message: 'Your hub transfer was approved and is awaiting volunteer assignment.',
        type: NotificationType.DELIVERY_UPDATE,
        status: NotificationStatus.UNREAD,
      });
      return transfer;
    });
  }

  async rejectTransfer(
    transferId: string,
    adminId: string,
    adminRole: string,
    reason?: string,
  ): Promise<BookTransfer> {
    this.assertAdmin(adminRole);
    const transfer = await this.findTransfer(transferId);
    if (transfer.status !== BookTransferStatus.PENDING) {
      throw new BadRequestException('Only pending transfers can be rejected');
    }
    return this.dataSource.transaction(async (manager) => {
      const books = manager.getRepository(Book);
      const book = await books.findOneBy({ id: transfer.book_id });
      if (!book) {
        throw new NotFoundException(`Book with ID ${transfer.book_id} not found`);
      }
      if (
        book.store_id !== transfer.source_store_id ||
        book.status !== BookStatus.TRANSFERRING
      ) {
        throw new BadRequestException(
          'Book is not in the expected transfer state',
        );
      }
      book.status = BookStatus.AVAILABLE;
      transfer.status = BookTransferStatus.REJECTED;
      transfer.decision_note = reason?.trim() || null;
      transfer.decided_by = adminId;
      transfer.decided_at = new Date();
      await books.save(book);
      return manager.getRepository(BookTransfer).save(transfer);
    });
  }

  async createDispute(
    reporterId: string,
    reason: string,
    rentalId?: string,
    deliveryId?: string,
  ): Promise<Dispute> {
    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      throw new BadRequestException('Dispute reason cannot be empty');
    }
    if (Boolean(rentalId) === Boolean(deliveryId)) {
      throw new BadRequestException(
        'A dispute must reference exactly one rental or delivery',
      );
    }
    if (rentalId) {
      const rental = await this.rentalRepository.findOneBy({ id: rentalId });
      if (!rental) {
        throw new NotFoundException(`Rental with ID ${rentalId} not found`);
      }
      if (rental.renter_id !== reporterId) {
        throw new ForbiddenException('Only the renter can dispute this rental');
      }
    }
    if (deliveryId) {
      const delivery = await this.deliveryRepository.findOneBy({ id: deliveryId });
      if (!delivery) {
        throw new NotFoundException(`Delivery with ID ${deliveryId} not found`);
      }
      if (delivery.requester_id !== reporterId) {
        throw new ForbiddenException(
          'Only the delivery requester can dispute this delivery',
        );
      }
    }

    return this.disputeRepository.save(
      this.disputeRepository.create({
        reported_by: reporterId,
        rental_id: rentalId ?? null,
        delivery_id: deliveryId ?? null,
        reason: normalizedReason,
        status: DisputeStatus.OPEN,
        resolution: null,
        handled_by: null,
        handled_at: null,
      }),
    );
  }

  async findDisputes(adminRole: string): Promise<Dispute[]> {
    this.assertAdmin(adminRole);
    return this.disputeRepository.find({ order: { created_at: 'DESC' } });
  }

  async handleDispute(
    disputeId: string,
    resolution: string,
    status: DisputeStatus.RESOLVED | DisputeStatus.REJECTED,
    adminId: string,
    adminRole: string,
  ): Promise<Dispute> {
    this.assertAdmin(adminRole);
    const normalizedResolution = resolution.trim();
    if (!normalizedResolution) {
      throw new BadRequestException('A resolution note is required');
    }
    if (
      status !== DisputeStatus.RESOLVED &&
      status !== DisputeStatus.REJECTED
    ) {
      throw new BadRequestException(
        'A dispute must be resolved or rejected',
      );
    }
    const dispute = await this.findDispute(disputeId);
    if (dispute.status !== DisputeStatus.OPEN) {
      throw new BadRequestException('Only open disputes can be handled');
    }
    dispute.status = status;
    dispute.resolution = normalizedResolution;
    dispute.handled_by = adminId;
    dispute.handled_at = new Date();
    return this.disputeRepository.save(dispute);
  }

  private assertAdmin(role: string): void {
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only an administrator can perform this action');
    }
  }

  private async findBook(bookId: string): Promise<Book> {
    const book = await this.bookRepository.findOneBy({ id: bookId });
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }
    return book;
  }

  private async findTransfer(transferId: string): Promise<BookTransfer> {
    const transfer = await this.transferRepository.findOneBy({ id: transferId });
    if (!transfer) {
      throw new NotFoundException(`Transfer with ID ${transferId} not found`);
    }
    return transfer;
  }

  private async findDispute(disputeId: string): Promise<Dispute> {
    const dispute = await this.disputeRepository.findOneBy({ id: disputeId });
    if (!dispute) {
      throw new NotFoundException(`Dispute with ID ${disputeId} not found`);
    }
    return dispute;
  }

  private assertBookPending(book: Book): void {
    if (book.status !== BookStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Book is not awaiting approval');
    }
  }
}

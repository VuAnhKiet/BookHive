import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from 'src/entities/book.entity';
import { DataSource, ILike, In, MoreThan, Repository } from 'typeorm';
import { CreateBookInput } from './input/create.book.input';
import { PaginationInput } from './input/pagination.input';
import { UpdateBookInput } from './input/update-book.input';
import { BookStatus } from 'src/common/enum/book/book-status.enum';
import { UserRole } from 'src/common/enum/user/user-role.enum';
import { Rental } from 'src/entities/rental.entity';
import { RentalStatus } from 'src/common/enum/user/rental-status.enum';

const RESERVED_RENTAL_STATUSES = [
  RentalStatus.PENDING,
  RentalStatus.APPROVED,
  RentalStatus.ACTIVE,
  RentalStatus.OVERDUE,
];

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book) private readonly bookRepository: Repository<Book>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createBookInput: CreateBookInput, ownerId: string): Promise<Book> {
    const book = this.bookRepository.create({
      ...createBookInput,
      owner_id: ownerId,
      store_id: null,
      status: BookStatus.PENDING_APPROVAL,
      late_fee_per_day: createBookInput.late_fee_per_day ?? 0,
      copies: 1,
    });

    return this.bookRepository.save(book);
  }

  async findAll(pagination?: PaginationInput): Promise<Book[]> {
    const page = Math.max(1, Number(pagination?.page ?? 1) || 1);
    const limit = Math.max(1, Number(pagination?.limit ?? 10) || 10);

    return this.bookRepository.find({
      where: { status: BookStatus.AVAILABLE, copies: MoreThan(0) },
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });
  }

  async findById(id: string): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: { store: true },
    });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async search(searchTerm: string): Promise<Book[]> {
    const term = searchTerm.trim();
    if (!term) {
      return [];
    }

    return this.bookRepository.find({
      where: [
        { title: ILike(`%${term}%`), status: BookStatus.AVAILABLE, copies: MoreThan(0) },
        { author: ILike(`%${term}%`), status: BookStatus.AVAILABLE, copies: MoreThan(0) },
        { genre: ILike(`%${term}%`), status: BookStatus.AVAILABLE, copies: MoreThan(0) },
        { description: ILike(`%${term}%`), status: BookStatus.AVAILABLE, copies: MoreThan(0) },
      ],
      order: { title: 'ASC' },
    });
  }

  async update(
    id: string,
    updateBookInput: UpdateBookInput,
    userId: string,
    userRole: string,
  ): Promise<Book> {
    const book = await this.findById(id);
    this.assertBookOwner(book, userId, userRole);
    Object.assign(book, updateBookInput);
    return this.bookRepository.save(book);
  }

  async delete(id: string, userId: string, userRole: string): Promise<boolean> {
    const book = await this.findById(id);
    this.assertBookOwner(book, userId, userRole);
    const reservedRentals = await this.dataSource.getRepository(Rental).count({
      where: {
        book_id: id,
        status: In(RESERVED_RENTAL_STATUSES),
      },
    });
    if (reservedRentals > 0) {
      throw new BadRequestException(
        'Cannot remove a book with pending or active rental requests',
      );
    }
    const result = await this.bookRepository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return true;
  }

  async addCopy(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<Book> {
    return this.dataSource.transaction(async (manager) => {
      const books = manager.getRepository(Book);
      const book = await books.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!book) {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }
      this.assertBookOwner(book, userId, userRole);

      book.copies += 1;
      if (
        book.status === BookStatus.RENTED &&
        (await manager.getRepository(Rental).count({
          where: {
            book_id: id,
            status: In([RentalStatus.ACTIVE, RentalStatus.OVERDUE]),
          },
        })) < book.copies
      ) {
        book.status = BookStatus.AVAILABLE;
      }
      return books.save(book);
    });
  }

  async removeCopy(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<Book> {
    return this.dataSource.transaction(async (manager) => {
      const books = manager.getRepository(Book);
      const book = await books.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!book) {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }
      this.assertBookOwner(book, userId, userRole);
      if (book.copies < 1) {
        throw new BadRequestException('Book has no copies to remove');
      }

      const reservedCopies = await manager.getRepository(Rental).count({
        where: {
          book_id: id,
          status: In(RESERVED_RENTAL_STATUSES),
        },
      });
      if (reservedCopies > book.copies - 1) {
        throw new BadRequestException(
          'Cannot remove a copy that is already requested or rented',
        );
      }

      book.copies -= 1;
      if (
        book.status === BookStatus.AVAILABLE ||
        book.status === BookStatus.RENTED
      ) {
        const checkedOutCopies = await manager.getRepository(Rental).count({
          where: {
            book_id: id,
            status: In([RentalStatus.ACTIVE, RentalStatus.OVERDUE]),
          },
        });
        book.status =
          book.copies > 0 && checkedOutCopies >= book.copies
            ? BookStatus.RENTED
            : BookStatus.AVAILABLE;
      }
      return books.save(book);
    });
  }

  private assertBookOwner(
    book: Book,
    userId: string,
    userRole: string,
  ): void {
    if (book.owner_id !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only the book owner can manage this book');
    }
  }
}

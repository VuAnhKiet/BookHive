import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from 'src/entities/book.entity';
import { Store } from 'src/entities/store.entity';
import { UserRole } from 'src/common/enum/user/user-role.enum';
import { BookStatus } from 'src/common/enum/book/book-status.enum';
import { Repository } from 'typeorm';
import { CreateStoreInput } from './input/create-store.input';
import { UpdateStoreInput } from './input/update-store.input';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async create(createStoreInput: CreateStoreInput): Promise<Store> {
    const store = this.storeRepository.create(createStoreInput);
    return this.storeRepository.save(store);
  }

  async findAll(): Promise<Store[]> {
    return this.storeRepository.find();
  }

  async findById(id: string): Promise<Store> {
    const store = await this.storeRepository.findOneBy({ id });
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return store;
  }

  async update(id: string, updateStoreInput: UpdateStoreInput): Promise<Store> {
    const store = await this.findById(id);
    Object.assign(store, updateStoreInput);
    return this.storeRepository.save(store);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.storeRepository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return true;
  }

  async getInventory(storeId: string): Promise<Book[]> {
    await this.findById(storeId);
    return this.bookRepository.find({
      where: { store_id: storeId },
      order: { title: 'ASC' },
    });
  }

  async addBook(
    storeId: string,
    bookId: string,
    lenderId: string,
  ): Promise<Book> {
    await this.findById(storeId);
    const book = await this.bookRepository.findOneBy({ id: bookId });
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }
    if (book.owner_id !== lenderId) {
      throw new ForbiddenException('Only the book owner can submit it');
    }
    if (book.store_id) {
      throw new BadRequestException('Book is already assigned to a store');
    }
    if (
      book.status !== BookStatus.PENDING_APPROVAL &&
      book.status !== BookStatus.REJECTED
    ) {
      throw new BadRequestException('Book is not awaiting store handover');
    }

    book.store_id = storeId;
    book.status = BookStatus.PENDING_APPROVAL;
    return this.bookRepository.save(book);
  }

  async removeBook(
    storeId: string,
    bookId: string,
    managerId: string,
    managerRole: string,
  ): Promise<Book> {
    const store = await this.findById(storeId);
    this.assertStoreManager(store, managerId, managerRole);

    const book = await this.bookRepository.findOneBy({
      id: bookId,
      store_id: storeId,
    });
    if (!book) {
      throw new NotFoundException(
        `Book with ID ${bookId} was not found in this store`,
      );
    }

    book.store_id = null;
    book.status = BookStatus.PENDING_APPROVAL;
    return this.bookRepository.save(book);
  }

  async approveBookHandover(
    storeId: string,
    bookId: string,
    managerId: string,
    managerRole: string,
  ): Promise<Book> {
    const store = await this.findById(storeId);
    this.assertStoreManager(store, managerId, managerRole);

    const book = await this.bookRepository.findOneBy({
      id: bookId,
      store_id: storeId,
    });
    if (!book) {
      throw new NotFoundException(
        `Book with ID ${bookId} was not found in this store`,
      );
    }
    if (book.status !== BookStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Book is not awaiting handover approval');
    }

    book.status = BookStatus.AVAILABLE;
    return this.bookRepository.save(book);
  }

  private assertStoreManager(
    store: Store,
    managerId: string,
    managerRole?: string,
  ): void {
    if (
      store.store_manager_id !== managerId ||
      (managerRole !== undefined && managerRole !== UserRole.STORE_MANAGER)
    ) {
      throw new ForbiddenException(
        'Only this store’s manager can perform this action',
      );
    }
  }
}

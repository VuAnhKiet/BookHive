import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { Wishlist } from 'src/entities/wishlist.entity';
import { Book } from 'src/entities/book.entity';
import { Cart } from 'src/entities/cart.entity';
import { BookStatus } from 'src/common/enum/book/book-status.enum';
import { Repository } from 'typeorm';
import { UpdateProfileInput } from './input/update-profile.input';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Book) private readonly bookRepository: Repository<Book>,
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { stores: true, books: { store: true } },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async update(
    id: string,
    updateUserInput: UpdateProfileInput,
  ): Promise<User> {
    const user = await this.findById(id);

    if (updateUserInput.email && updateUserInput.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserInput.email);
      if (existingUser) {
        throw new ConflictException('This email is already registered!');
      }
    }

    Object.assign(user, updateUserInput);
    await this.userRepository.save(user);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return true;
  }

  async updateProfile(
    id: string,
    updateProfileInput: UpdateProfileInput,
  ): Promise<User> {
    return this.update(id, updateProfileInput);
  }

  async sendRequestToAdmin(userId: string): Promise<boolean> {
    console.log(`User with ID ${userId} has sent a request to the admin.`);
    return true;
  }

  async getWishlist(userId: string): Promise<Wishlist[]> {
    return this.wishlistRepository.find({
      where: { renter_id: userId },
      relations: { book: true },
      order: { created_at: 'DESC' },
    });
  }

  async addToWishlist(userId: string, bookId: string): Promise<Wishlist> {
    const book = await this.bookRepository.findOneBy({ id: bookId });
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    const existing = await this.wishlistRepository.findOne({
      where: { renter_id: userId, book_id: bookId },
      relations: { book: true },
    });
    if (existing) {
      return existing;
    }

    return this.wishlistRepository.save(
      this.wishlistRepository.create({
        renter_id: userId,
        book_id: bookId,
        book,
      }),
    );
  }

  async removeFromWishlist(userId: string, bookId: string): Promise<boolean> {
    const result = await this.wishlistRepository.softDelete({
      renter_id: userId,
      book_id: bookId,
    });
    return (result.affected ?? 0) > 0;
  }

  async getCart(userId: string): Promise<Cart[]> {
    return this.cartRepository.find({
      where: { user_id: userId },
      relations: { book: true },
      order: { created_at: 'DESC' },
    });
  }

  async addToCart(userId: string, bookId: string): Promise<Cart> {
    const book = await this.bookRepository.findOneBy({ id: bookId });
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }
    if (book.status !== BookStatus.AVAILABLE || book.copies < 1) {
      throw new BadRequestException('This book is not currently available.');
    }

    const existing = await this.cartRepository.findOne({
      where: { user_id: userId, book_id: bookId },
      relations: { book: true },
    });
    if (existing) {
      if (existing.quantity >= book.copies) {
        throw new BadRequestException('Your cart already has all available copies.');
      }
      existing.quantity += 1;
      return this.cartRepository.save(existing);
    }

    return this.cartRepository.save(
      this.cartRepository.create({
        user_id: userId,
        book_id: bookId,
        quantity: 1,
        book,
      }),
    );
  }

  async updateCartQuantity(
    userId: string,
    bookId: string,
    quantity: number,
  ): Promise<Cart> {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestException('Cart quantity must be a positive integer.');
    }
    const cartItem = await this.cartRepository.findOne({
      where: { user_id: userId, book_id: bookId },
      relations: { book: true },
    });
    if (!cartItem) {
      throw new NotFoundException('Cart item not found.');
    }
    if (quantity > cartItem.book.copies) {
      throw new BadRequestException('Requested quantity exceeds available copies.');
    }
    cartItem.quantity = quantity;
    return this.cartRepository.save(cartItem);
  }

  async removeFromCart(userId: string, bookId: string): Promise<boolean> {
    const result = await this.cartRepository.softDelete({
      user_id: userId,
      book_id: bookId,
    });
    return (result.affected ?? 0) > 0;
  }
}

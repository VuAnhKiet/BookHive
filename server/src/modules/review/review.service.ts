import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RentalStatus } from '../../common/enum/user/rental-status.enum';
import { UserRole } from '../../common/enum/user/user-role.enum';
import { Book } from '../../entities/book.entity';
import { Rental } from '../../entities/rental.entity';
import { Review } from '../../entities/review.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Rental)
    private readonly rentalRepository: Repository<Rental>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async create(
    bookId: string,
    rentalId: string,
    userId: string,
    rating: number,
    comment: string,
  ): Promise<Review> {
    this.validateReview(rating, comment);

    const rental = await this.rentalRepository.findOneBy({ id: rentalId });
    if (!rental) {
      throw new NotFoundException(`Rental with ID ${rentalId} not found`);
    }
    if (rental.renter_id !== userId || rental.book_id !== bookId) {
      throw new ForbiddenException(
        'A review can only be created for your own rental of this book',
      );
    }
    if (rental.status !== RentalStatus.RETURNED) {
      throw new BadRequestException('Only returned rentals can be reviewed');
    }

    const book = await this.bookRepository.findOneBy({ id: bookId });
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }
    if (await this.reviewRepository.findOneBy({ renter_id: userId, book_id: bookId })) {
      throw new ConflictException('You have already reviewed this book');
    }

    return this.reviewRepository.save(
      this.reviewRepository.create({
        renter_id: userId,
        book_id: bookId,
        store_id: rental.store_id,
        rating,
        comment: comment.trim(),
      }),
    );
  }

  async findByBook(bookId: string): Promise<Review[]> {
    const book = await this.bookRepository.findOneBy({ id: bookId });
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }
    return this.reviewRepository.find({
      where: { book_id: bookId },
      relations: { renter: true },
      order: { created_at: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { renter_id: userId },
      relations: { book: true, store: true },
      order: { created_at: 'DESC' },
    });
  }

  async update(
    reviewId: string,
    userId: string,
    userRole: string,
    rating?: number,
    comment?: string,
  ): Promise<Review> {
    if (rating === undefined && comment === undefined) {
      throw new BadRequestException('Provide a rating or comment to update');
    }
    const review = await this.findById(reviewId);
    this.assertCanManage(review, userId, userRole);

    const nextRating = rating ?? review.rating;
    const nextComment = comment === undefined ? review.comment : comment.trim();
    this.validateReview(nextRating, nextComment);

    review.rating = nextRating;
    review.comment = nextComment;
    return this.reviewRepository.save(review);
  }

  async delete(
    reviewId: string,
    userId: string,
    userRole: string,
  ): Promise<boolean> {
    const review = await this.findById(reviewId);
    this.assertCanManage(review, userId, userRole);
    await this.reviewRepository.softRemove(review);
    return true;
  }

  async calculateRating(bookId: string): Promise<number> {
    const book = await this.bookRepository.findOneBy({ id: bookId });
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .where('review.book_id = :bookId', { bookId })
      .getRawOne<{ average: string | null }>();
    return result?.average === null || result?.average === undefined
      ? 0
      : Math.round(Number(result.average) * 100) / 100;
  }

  private async findById(reviewId: string): Promise<Review> {
    const review = await this.reviewRepository.findOneBy({ id: reviewId });
    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }
    return review;
  }

  private assertCanManage(
    review: Review,
    userId: string,
    userRole: string,
  ): void {
    if (userRole !== UserRole.ADMIN && review.renter_id !== userId) {
      throw new ForbiddenException('You cannot modify this review');
    }
  }

  private validateReview(rating: number, comment: string): void {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be an integer from 1 to 5');
    }
    if (!comment.trim()) {
      throw new BadRequestException('Review comment cannot be empty');
    }
  }
}

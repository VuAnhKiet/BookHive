import { Book } from '../../../types/book';
import { formatCurrency } from '../../../utils/formatCurrency';

type BookSummaryProps = {
  book: Book;
  averageRating: number;
  reviewCount: number;
};

function BookSummary({ book, averageRating, reviewCount }: BookSummaryProps) {
  const roundedRating = Math.round(averageRating);
  const isAvailable = book.status === 'AVAILABLE' && book.copies > 0;

  return (
    <div className="book-details-summary">
      <h1 className="book-details-title">{book.title}</h1>
      <div className="book-details-author">{book.author}</div>
      <div className="book-availability">
        <div className={`book-status status-${book.status.toLowerCase()}`}>
          {isAvailable ? 'Available' : book.status.replaceAll('_', ' ').toLowerCase()}
        </div>
      </div>
      <p><strong>Genre:</strong> {book.genre}</p>
      <p><strong>Location:</strong> {book.store?.location ?? 'Not assigned to a hub'}</p>
      <p>
        <strong>Rating:</strong>{' '}
        {'★'.repeat(roundedRating)}
        {'☆'.repeat(5 - roundedRating)}
        {' '}({averageRating.toFixed(1)}/5, {reviewCount} reviews)
      </p>
      <p><strong>Rental price:</strong> {formatCurrency(book.rental_price_per_day)} per day</p>
      <p><strong>Copies in listing:</strong> {book.copies}</p>
    </div>
  );
}

export default BookSummary;

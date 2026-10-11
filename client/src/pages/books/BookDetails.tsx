import './BookDetails.css';
import { useParams } from 'react-router-dom';
import { useReaderArea } from '../../hooks/useReaderArea';
import { useGetBookDetailsQuery } from '../../services/bookService';
import BookActions from './components/BookActions';
import BookReviews from './components/BookReviews';
import BookSummary from './components/BookSummary';
import BookDescription from './components/BookDescription';
import { getApiErrorMessage } from '../../utils/apiError';

function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isFetching, error } = useGetBookDetailsQuery(id ?? '', {
    skip: !id,
  });
  const { selectedLocation, selectLocation } = useReaderArea();

  if (!id) {
    return <p className="book-detail-message book-detail-error" role="alert">A book ID is required.</p>;
  }
  if (isLoading || isFetching) {
    return <p className="book-detail-message" role="status">Loading book details…</p>;
  }
  if (error) {
    return (
      <p className="book-detail-message book-detail-error" role="alert">
        {getApiErrorMessage(error, 'Could not load this book.')}
      </p>
    );
  }
  if (!data?.book) {
    return <p className="book-detail-message">This book could not be found.</p>;
  }
  const {
    book,
    stores: hubs,
    findByBook: reviews,
    calculateRating: averageRating,
  } = data;

  return (
    <section id="book-details-page" className="book-details-page">
      <div className="book-details">
        <div className="book-details-cover">
          <img src={book.cover_image} alt={`Cover of ${book.title}`} />
        </div>
        <div className="book-details-info">
          <BookSummary
            book={book}
            averageRating={averageRating}
            reviewCount={reviews.length}
          />
          <div className="book-details-purchase">
            <BookActions
              book={book}
              hubs={hubs}
              selectedLocation={selectedLocation}
              onLocationChange={selectLocation}
            />
          </div>
          <BookDescription key={book.id} description={book.description} />
        </div>
      </div>
      <BookReviews reviews={reviews} />
    </section>
  );
}

export default BookDetails;

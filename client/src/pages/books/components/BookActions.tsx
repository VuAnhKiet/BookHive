import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRentalRequestMutation } from '../../../services/rentalService';
import { useAddToWishlistMutation } from '../../../services/wishlistService';
import { useAddToCartMutation } from '../../../services/cartService';
import { useAppSelector } from '../../../store/hooks';
import { Book, Hub } from '../../../types/book';
import { getApiErrorMessage } from '../../../utils/apiError';
import BookDetailsModal from './BookDetailsModal';
import BookLocationAvailability from './BookLocationAvailability';

type BookActionsProps = {
  book: Book;
  hubs: Hub[];
  selectedLocation: string;
  onLocationChange: (location: string) => void;
};

function asDateInputValue(date: Date): string {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function BookActions({
  book,
  hubs,
  selectedLocation,
  onLocationChange,
}: BookActionsProps) {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [startDate, setStartDate] = useState(() => asDateInputValue(new Date()));
  const [dueDate, setDueDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    return asDateInputValue(tomorrow);
  });
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [hasRentalBeenSubmitted, setHasRentalBeenSubmitted] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [createRentalRequest, { isLoading }] = useCreateRentalRequestMutation();
  const [addToWishlist, { isLoading: isSavingWishlist }] = useAddToWishlistMutation();
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const navigate = useNavigate();
  const isAvailable = book.status === 'AVAILABLE' && book.copies > 0;

  useEffect(() => {
    if (!message && !formError) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setMessage('');
      setFormError('');
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [message, formError]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setMessage('');
    setHasRentalBeenSubmitted(false);
    if (new Date(dueDate) <= new Date(startDate)) {
      setFormError('The return date must be after the rental start date.');
      return;
    }
    try {
      const rental = await createRentalRequest({
        bookId: book.id,
        rentalStartDate: startDate,
        rentalDueDate: dueDate,
        timezoneOffsetMinutes: new Date().getTimezoneOffset(),
      }).unwrap();
      setMessage(`Rental request ${rental.id} was submitted for approval.`);
      setHasRentalBeenSubmitted(true);
      setIsRequestOpen(false);
    } catch (requestError: unknown) {
      setFormError(getApiErrorMessage(requestError, 'Could not request this rental.'));
    }
  }

  async function handleAddToWishlist() {
    setFormError('');
    setMessage('');
    try {
      await addToWishlist(book.id).unwrap();
      setMessage('Book added to your wishlist.');
    } catch (requestError: unknown) {
      setFormError(getApiErrorMessage(requestError, 'Could not update your wishlist.'));
    }
  }

  async function handleAddToCart() {
    setFormError('');
    setMessage('');
    try {
      await addToCart(book.id).unwrap();
      setMessage('Book added to your cart.');
    } catch (requestError: unknown) {
      setFormError(getApiErrorMessage(requestError, 'Could not add this book to your cart.'));
    }
  }

  if (!accessToken) {
    return (
      <div className="book-actions book-actions-guest">
        <p>Please log in to save this title or request a rental.</p>
      </div>
    );
  }

  return (
    <div className="book-actions">
      {isAvailable && book.store && (
        <button
          className="btn btn-success book-actions-request-trigger"
          type="button"
          onClick={() => setIsRequestOpen(true)}
          aria-haspopup="dialog"
        >
          Request this book
        </button>
      )}
      {isRequestOpen && isAvailable && book.store && (
        <BookDetailsModal
          title="Request this book"
          onClose={() => setIsRequestOpen(false)}
        >
          <form className="form-container book-actions-request" onSubmit={handleSubmit}>
            <h2>Request this book</h2>
            <p className="book-actions-request-store">
              Pickup location: {book.store.name} — {book.store.location}
            </p>
            <div className="form-group">
              <label htmlFor="rental-start-date">Pickup date</label>
              <input
                id="rental-start-date"
                type="date"
                value={startDate}
                min={asDateInputValue(new Date())}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="rental-due-date">Return by</label>
              <input
                id="rental-due-date"
                type="date"
                value={dueDate}
                min={startDate}
                onChange={(event) => setDueDate(event.target.value)}
                required
              />
            </div>
            <button className="btn btn-success" type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting…' : 'Request Rental'}
            </button>
          </form>
        </BookDetailsModal>
      )}
      {isAvailable && !book.store && (
        <p className="book-actions-notice" role="status">
          <span aria-hidden="true">ⓘ</span>
          <span>This book isn’t assigned to a store yet, so rental requests aren’t available.</span>
        </p>
      )}
      <div className="book-actions-toolbar" aria-label="Book actions">
        <button
          className="btn book-action-secondary"
          type="button"
          onClick={handleAddToWishlist}
          disabled={isSavingWishlist}
        >
          <span aria-hidden="true">♡</span>
          {isSavingWishlist ? 'Saving…' : 'Add to Wishlist'}
        </button>
        <button
          className="btn btn-success"
          type="button"
          onClick={handleAddToCart}
          disabled={!isAvailable || isAddingToCart}
        >
          <span aria-hidden="true">🛒</span>
          {isAddingToCart ? 'Adding…' : 'Add to Cart'}
        </button>
        <BookLocationAvailability
          book={book}
          hubs={hubs}
          selectedLocation={selectedLocation}
          onLocationChange={onLocationChange}
        />
      </div>
      {message && <p className="book-actions-feedback" role="status">{message}</p>}
      {formError && <p className="book-actions-error" role="alert">{formError}</p>}
      {hasRentalBeenSubmitted && (
        <button
          className="btn book-actions-rentals-link"
          type="button"
          onClick={() => navigate('/rental-history')}
        >
          View my rentals
        </button>
      )}
    </div>
  );
}

export default BookActions;

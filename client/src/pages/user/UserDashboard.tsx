import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import BookDetailsModal from '../books/components/BookDetailsModal';
import { useGetUserProfileQuery } from '../../services/profileService';
import {
  useRemoveLentBookMutation,
  useUpdateLentBookMutation,
} from '../../services/bookService';
import {
  useCancelRentalRequestMutation,
  useGetUserRentalsQuery,
  useReturnBookMutation,
} from '../../services/rentalService';
import { useGetUserReviewsQuery } from '../../services/reviewService';
import { useGetWishlistQuery } from '../../services/wishlistService';
import { formatDateOnly } from '../../utils/date';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatCurrency } from '../../utils/formatCurrency';

const CURRENT_RENTAL_STATUSES = ['ACTIVE', 'OVERDUE'];

function UserDashboard() {
  const profileQuery = useGetUserProfileQuery();
  const rentalsQuery = useGetUserRentalsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const reviewsQuery = useGetUserReviewsQuery();
  const wishlistQuery = useGetWishlistQuery();
  const [returnBook] = useReturnBookMutation();
  const [cancelRental] = useCancelRentalRequestMutation();
  const [updateLentBook, { isLoading: isSavingLentBook }] =
    useUpdateLentBookMutation();
  const [removeLentBook, { isLoading: isRemovingLentBook }] =
    useRemoveLentBookMutation();
  const [actionError, setActionError] = useState('');
  const [bookManagementError, setBookManagementError] = useState('');
  const [bookManagementMessage, setBookManagementMessage] = useState('');
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [bookPendingRemoval, setBookPendingRemoval] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    author: '',
    genre: '',
    description: '',
    cover_image: '',
    rental_price_per_day: '',
  });
  const rentals = rentalsQuery.data ?? [];
  const lentBooks = profileQuery.data?.books ?? [];
  const currentRentals = rentals.filter((rental) =>
    CURRENT_RENTAL_STATUSES.includes(rental.status.toUpperCase()),
  );
  const pendingRentals = rentals.filter((rental) =>
    ['PENDING', 'APPROVED'].includes(rental.status.toUpperCase()),
  );
  const readRentals = rentals.filter(
    (rental) => rental.status.toUpperCase() === 'RETURNED',
  );
  const reviews = reviewsQuery.data ?? [];
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  const errors = [
    profileQuery.error,
    rentalsQuery.error,
    reviewsQuery.error,
    wishlistQuery.error,
  ].filter(Boolean);

  async function handleRentalAction(rentalId: string, action: 'return' | 'cancel') {
    setActionError('');
    try {
      if (action === 'return') {
        await returnBook(rentalId).unwrap();
      } else {
        await cancelRental(rentalId).unwrap();
      }
    } catch (requestError: unknown) {
      setActionError(getApiErrorMessage(requestError, 'Could not update this rental.'));
    }
  }

  function startEditingBook(bookId: string) {
    const book = lentBooks.find((item) => item.id === bookId);
    if (!book) return;

    setBookManagementError('');
    setBookManagementMessage('');
    setEditingBookId(book.id);
    setEditForm({
      title: book.title,
      author: book.author,
      genre: book.genre,
      description: book.description,
      cover_image: book.cover_image,
      rental_price_per_day: String(book.rental_price_per_day),
    });
  }

  async function handleSaveBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingBookId) return;

    setBookManagementError('');
    setBookManagementMessage('');
    try {
      await updateLentBook({
        id: editingBookId,
        updateBookInput: {
          ...editForm,
          rental_price_per_day: Number(editForm.rental_price_per_day),
        },
      }).unwrap();
      setEditingBookId(null);
      setBookManagementMessage('Book details updated.');
    } catch (requestError: unknown) {
      setBookManagementError(
        getApiErrorMessage(requestError, 'Could not update this book.'),
      );
    }
  }

  function handleRemoveBook(bookId: string, title: string) {
    setBookManagementError('');
    setBookManagementMessage('');
    setBookPendingRemoval({ id: bookId, title });
  }

  async function confirmRemoveBook() {
    if (!bookPendingRemoval) return;

    const { id, title } = bookPendingRemoval;
    try {
      await removeLentBook(id).unwrap();
      setBookManagementMessage(`"${title}" was removed.`);
      setBookPendingRemoval(null);
    } catch (requestError: unknown) {
      setBookManagementError(
        getApiErrorMessage(requestError, 'Could not remove this book.'),
      );
    }
  }

  return (
    <section id="dashboard">
      <h2 className="section-title">Dashboard</h2>
      {errors.length > 0 && (
        <p role="alert">{getApiErrorMessage(
          errors[0],
          'Some dashboard data could not be loaded. Sign in again or retry.',
        )}</p>
      )}
      {actionError && <p className="book-detail-error" role="alert">{actionError}</p>}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">{currentRentals.length}</div>
          <div className="stat-label">Currently Borrowed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{readRentals.length}</div>
          <div className="stat-label">Books Read</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{averageRating.toFixed(1)}</div>
          <div className="stat-label">Average Rating</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{wishlistQuery.data?.length ?? 0}</div>
          <div className="stat-label">On Wishlist</div>
        </div>
      </div>

      <h3 className="section-title">My Lent Books</h3>
      <p>Track your submissions and update the details of books you have lent.</p>
      {bookManagementError && (
        <p className="book-detail-error" role="alert">{bookManagementError}</p>
      )}
      {bookManagementMessage && (
        <p className="notification" role="status">{bookManagementMessage}</p>
      )}
      {bookPendingRemoval && (
        <BookDetailsModal
          title="Confirm book removal"
          onClose={() => {
            if (!isRemovingLentBook) setBookPendingRemoval(null);
          }}
        >
          <div className="form-container lent-book-remove-confirm">
            <h2>Remove this book?</h2>
            {bookManagementError && (
              <p className="book-detail-error" role="alert">{bookManagementError}</p>
            )}
            <p>
              Are you sure you want to remove <strong>{bookPendingRemoval.title}</strong>
              {' '}from your lent books? This action cannot be undone.
            </p>
            <div className="form-actions">
              <button
                className="btn"
                type="button"
                onClick={() => setBookPendingRemoval(null)}
                disabled={isRemovingLentBook}
              >
                Keep book
              </button>
              <button
                className="btn btn-danger"
                type="button"
                onClick={() => void confirmRemoveBook()}
                disabled={isRemovingLentBook}
              >
                {isRemovingLentBook ? 'Removing…' : 'Remove book'}
              </button>
            </div>
          </div>
        </BookDetailsModal>
      )}
      {profileQuery.isLoading ? (
        <p role="status">Loading your lent books…</p>
      ) : lentBooks.length === 0 ? (
        <p>
          You have not submitted any books yet. <Link to="/lend-book">Lend a book</Link>.
        </p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Store</th>
                <th>Rental price / day</th>
                <th>Status</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {lentBooks.map((book) => (
                <tr key={book.id}>
                  <td>
                    <Link to={`/book/${book.id}`}>{book.title}</Link>
                    <div className="store-rental-subtext">{book.author}</div>
                  </td>
                  <td>{book.store?.name ?? 'Awaiting store assignment'}</td>
                  <td>{formatCurrency(book.rental_price_per_day)}</td>
                  <td>{book.status.replaceAll('_', ' ').toLowerCase()}</td>
                  <td>
                    <div className="store-rental-actions">
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => startEditingBook(book.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        type="button"
                        disabled={isRemovingLentBook}
                        onClick={() => void handleRemoveBook(book.id, book.title)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editingBookId && (
        <BookDetailsModal
          title="Edit lent book"
          onClose={() => {
            if (!isSavingLentBook) setEditingBookId(null);
          }}
        >
          <form className="form-container lent-book-edit-form" onSubmit={handleSaveBook}>
            <h2>Edit lent book</h2>
            {bookManagementError && (
              <p className="book-detail-error" role="alert">{bookManagementError}</p>
            )}
            <div className="form-group">
              <label htmlFor="lent-book-title">Title</label>
              <input
                id="lent-book-title"
                value={editForm.title}
                onChange={(event) => setEditForm({ ...editForm, title: event.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lent-book-author">Author</label>
              <input
                id="lent-book-author"
                value={editForm.author}
                onChange={(event) => setEditForm({ ...editForm, author: event.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lent-book-genre">Genre</label>
              <input
                id="lent-book-genre"
                value={editForm.genre}
                onChange={(event) => setEditForm({ ...editForm, genre: event.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lent-book-description">Description</label>
              <textarea
                id="lent-book-description"
                rows={4}
                value={editForm.description}
                onChange={(event) =>
                  setEditForm({ ...editForm, description: event.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lent-book-cover">Cover image URL</label>
              <input
                id="lent-book-cover"
                type="url"
                value={editForm.cover_image}
                onChange={(event) =>
                  setEditForm({ ...editForm, cover_image: event.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lent-book-price">Rental price per day</label>
              <input
                id="lent-book-price"
                type="number"
                min="0.01"
                step="0.01"
                value={editForm.rental_price_per_day}
                onChange={(event) =>
                  setEditForm({ ...editForm, rental_price_per_day: event.target.value })
                }
                required
              />
            </div>
            <div className="form-actions">
              <button
                className="btn"
                type="button"
                onClick={() => setEditingBookId(null)}
                disabled={isSavingLentBook}
              >
                Cancel
              </button>
              <button className="btn btn-success" type="submit" disabled={isSavingLentBook}>
                {isSavingLentBook ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </BookDetailsModal>
      )}

      <h3 className="section-title">Current Rentals</h3>
      {rentalsQuery.isLoading ? (
        <p role="status">Loading rentals…</p>
      ) : !currentRentals.length ? (
        <p>You have no current rentals. <Link to="/">Browse books.</Link></p>
      ) : (
        <div className="current-rentals">
          {currentRentals.map((rental) => (
            <article className="rental-item" key={rental.id}>
              <div className="rental-cover">
                <img src={rental.book.cover_image} alt="" />
              </div>
              <div className="rental-info">
                <Link className="rental-title" to={`/book/${rental.book.id}`}>
                  {rental.book.title}
                </Link>
                <div className="rental-author">{rental.book.author}</div>
                <div className="rental-date">
                  Due: {formatDateOnly(rental.rental_due_date)}
                </div>
              </div>
              <div className="rental-actions">
                {rental.status.toUpperCase() === 'ACTIVE' ? (
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => void handleRentalAction(rental.id, 'return')}
                  >
                    Return Book
                  </button>
                ) : (
                  <span>{rental.status.replaceAll('_', ' ')}</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <h3 className="section-title">Reading History</h3>
      {!readRentals.length ? (
        <p>Returned rentals will show here.</p>
      ) : (
        <div className="book-grid">
          {readRentals.map((rental) => {
            const review = reviews.find((item) => item.book?.id === rental.book.id);
            return (
              <div className="book-card" key={rental.id}>
                <div className="book-cover">
                  <img src={rental.book.cover_image} alt={`Cover of ${rental.book.title}`} />
                </div>
                <div className="book-info">
                  <div className="book-title">{rental.book.title}</div>
                  <div className="book-author">{rental.book.author}</div>
                  {review && (
                    <div className="book-rating" aria-label={`${review.rating} out of 5 stars`}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h3 className="section-title">Rental Requests</h3>
      {pendingRentals.length ? (
        <div className="current-rentals">
          {pendingRentals.map((rental) => (
            <article className="rental-item" key={rental.id}>
              <div className="rental-info">
                <Link className="rental-title" to={`/book/${rental.book.id}`}>
                  {rental.book.title}
                </Link>
                <div className="rental-author">{rental.status.replaceAll('_', ' ')}</div>
              </div>
              <button
                className="btn"
                type="button"
                onClick={() => void handleRentalAction(rental.id, 'cancel')}
              >
                Cancel Request
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p>No pending rental requests.</p>
      )}
    </section>
  );
}

export default UserDashboard;

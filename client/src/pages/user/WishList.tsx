import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from '../../services/wishlistService';
import { getApiErrorMessage } from '../../utils/apiError';

function WishList() {
  const { data: wishlist = [], isLoading, error } = useGetWishlistQuery();
  const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!actionError) {
      return;
    }

    const timeoutId = window.setTimeout(() => setActionError(''), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [actionError]);

  async function handleRemove(bookId: string) {
    setActionError('');
    try {
      await removeFromWishlist(bookId).unwrap();
    } catch (requestError: unknown) {
      setActionError(getApiErrorMessage(requestError, 'Could not remove this book.'));
    }
  }

  return (
    <section id="wishlist-page">
      <h2 className="section-title">My Wishlist</h2>
      {isLoading && <p role="status">Loading your wishlist…</p>}
      {error && (
        <p role="alert">
          {getApiErrorMessage(error, 'Could not load your wishlist.')}
        </p>
      )}
      {actionError && <p className="book-detail-error" role="alert">{actionError}</p>}
      {!isLoading && !error && !wishlist.length && (
        <p>Your wishlist is empty. Save books from their detail pages to find them here.</p>
      )}
      {!!wishlist.length && (
        <div className="book-grid">
          {wishlist.map(({ id, book }) => (
            <div className="book-card" key={id}>
              <div className="book-cover">
                <img src={book.cover_image} alt={`Cover of ${book.title}`} />
              </div>
              <div className="book-info">
                <Link className="book-title" to={`/book/${book.id}`}>{book.title}</Link>
                <div className="book-author">{book.author}</div>
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={() => void handleRemove(book.id)}
                  disabled={isRemoving}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default WishList;

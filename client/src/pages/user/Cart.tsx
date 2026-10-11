import './Cart.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateCartQuantityMutation,
} from '../../services/cartService';
import { getApiErrorMessage } from '../../utils/apiError';

function Cart() {
  const { data: items = [], isLoading, error } = useGetCartQuery();
  const [updateQuantity, { isLoading: isUpdating }] =
    useUpdateCartQuantityMutation();
  const [removeFromCart, { isLoading: isRemoving }] = useRemoveFromCartMutation();
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!actionError) {
      return;
    }

    const timeoutId = window.setTimeout(() => setActionError(''), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [actionError]);

  if (isLoading) return <p role="status">Loading your cart…</p>;
  if (error) {
    return <p role="alert">{getApiErrorMessage(error, 'Could not load your cart.')}</p>;
  }

  async function handleUpdateQuantity(bookId: string, quantity: number) {
    setActionError('');
    try {
      await updateQuantity({ bookId, quantity }).unwrap();
    } catch (requestError: unknown) {
      setActionError(getApiErrorMessage(requestError, 'Could not update this cart item.'));
    }
  }

  async function handleRemove(bookId: string) {
    setActionError('');
    try {
      await removeFromCart(bookId).unwrap();
    } catch (requestError: unknown) {
      setActionError(getApiErrorMessage(requestError, 'Could not remove this cart item.'));
    }
  }

  return (
    <section id="cart-page">
      <h2 className="section-title">Your Cart</h2>
      {actionError && <p className="book-detail-error" role="alert">{actionError}</p>}
      {items.length === 0 ? (
        <p>
          Your cart is empty. <Link to="/">Browse books</Link> to find something to borrow.
        </p>
      ) : (
        <ul className="cart-items">
          {items.map(({ book, quantity }) => (
            <li className="cart-item" key={book.id}>
              <Link className="cart-item-cover" to={`/book/${book.id}`}>
                <img src={book.cover_image} alt="" />
              </Link>
              <div className="cart-item-details">
                <Link className="cart-item-title" to={`/book/${book.id}`}>
                  {book.title}
                </Link>
                <p>{book.author}</p>
                <p>${Number(book.rental_price_per_day).toFixed(2)} per day</p>
                <div className="cart-item-actions">
                  <label htmlFor={`cart-quantity-${book.id}`}>Copies</label>
                  <select
                    id={`cart-quantity-${book.id}`}
                    value={quantity}
                    disabled={isUpdating || isRemoving}
                    onChange={(event) => {
                      void handleUpdateQuantity(book.id, Number(event.target.value));
                    }}
                  >
                    {Array.from({ length: Math.max(1, book.copies) }, (_, index) => index + 1).map(
                      (count) => (
                        <option key={count} value={count}>
                          {count}
                        </option>
                      ),
                    )}
                  </select>
                  <button
                    className="btn btn-danger"
                    type="button"
                    disabled={isUpdating || isRemoving}
                    onClick={() => {
                      void handleRemove(book.id);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Cart;

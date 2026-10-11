import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useCheckoutRentalMutation,
  useGetUserRentalsQuery,
} from '../../services/rentalService';
import { useGetUserProfileQuery } from '../../services/profileService';
import {
  usePayRentalWithWalletMutation,
  useStartMomoPaymentMutation,
} from '../../services/paymentService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateOnly } from '../../utils/date';

function RentalHistory() {
  const { data: rentals = [], isLoading, error } = useGetUserRentalsQuery(
    undefined,
    { refetchOnMountOrArgChange: true },
  );
  const profileQuery = useGetUserProfileQuery();
  const [payRentalWithWallet, { isLoading: isPayingWithWallet }] =
    usePayRentalWithWalletMutation();
  const [startMomoPayment, { isLoading: isStartingMomo }] = useStartMomoPaymentMutation();
  const [checkoutRental, { isLoading: isCheckingOut }] = useCheckoutRentalMutation();
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  async function handlePayAndCheckout(rentalId: string) {
    setActionError('');
    setActionMessage('');
    try {
      await payRentalWithWallet(rentalId).unwrap();
      await checkoutRental(rentalId).unwrap();
      setActionMessage('Payment completed and the rental was checked out.');
    } catch (requestError: unknown) {
      setActionError(getApiErrorMessage(requestError, 'Could not complete this rental.'));
    }
  }

  async function handleCheckout(rentalId: string) {
    setActionError('');
    setActionMessage('');
    try {
      await checkoutRental(rentalId).unwrap();
      setActionMessage('Rental checked out.');
    } catch (requestError: unknown) {
      setActionError(getApiErrorMessage(requestError, 'Could not check out this rental.'));
    }
  }

  async function handleMomoPayment(rentalId: string) {
    setActionError('');
    try {
      const checkout = await startMomoPayment(rentalId).unwrap();
      window.location.assign(checkout.payUrl);
    } catch (requestError: unknown) {
      setActionError(getApiErrorMessage(requestError, 'Could not start MoMo checkout.'));
    }
  }

  if (isLoading || profileQuery.isLoading) {
    return <p role="status">Loading rental history…</p>;
  }
  if (error || profileQuery.error) {
    return (
      <p role="alert">
        {getApiErrorMessage(error ?? profileQuery.error, 'Could not load rental history.')}
      </p>
    );
  }

  return (
    <section id="rental-history-page">
      <h2 className="section-title">Rental History</h2>
      <p>
        Wallet balance: {formatCurrency(profileQuery.data?.wallet_balance)}
      </p>
      {actionError && <p className="book-detail-error" role="alert">{actionError}</p>}
      {actionMessage && <p role="status">{actionMessage}</p>}
      {!rentals.length ? (
        <p>You have no rentals yet. <Link to="/">Browse available books.</Link></p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Title</th>
                <th>Author</th>
                <th>Rented Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => {
                const rentalStatus = rental.status.toUpperCase();
                const paymentStatus = rental.payment_status.toUpperCase();
                const rentalAmount = Number(rental.total_amount);
                const walletBalance = Number(
                  profileQuery.data?.wallet_balance ?? 0,
                );
                const hasValidAmount =
                  Number.isFinite(rentalAmount) && rentalAmount > 0;
                const canPayWithWallet =
                  hasValidAmount && walletBalance >= rentalAmount;
                const canPayWithMomo =
                  Number.isSafeInteger(rentalAmount) && rentalAmount > 0;

                return (
                  <tr key={rental.id}>
                    <td>
                      <img
                        src={rental.book.cover_image}
                        alt=""
                        style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '3px' }}
                      />
                    </td>
                    <td><Link to={`/book/${rental.book.id}`}>{rental.book.title}</Link></td>
                    <td>{rental.book.author}</td>
                    <td>{formatDateOnly(rental.rental_start_date)}</td>
                    <td>{formatDateOnly(rental.return_date ?? rental.rental_due_date)}</td>
                    <td>{rental.status.replaceAll('_', ' ')}</td>
                    <td>
                      {rentalStatus === 'APPROVED' && paymentStatus === 'COMPLETED' ? (
                        <button
                          className="btn btn-primary"
                          type="button"
                          onClick={() => void handleCheckout(rental.id)}
                          disabled={isPayingWithWallet || isCheckingOut}
                        >
                          Checkout
                        </button>
                      ) : rentalStatus === 'APPROVED' &&
                        paymentStatus === 'REFUNDED' ? (
                        <span>Refunded payments cannot be retried.</span>
                      ) : rentalStatus === 'APPROVED' ? (
                        !hasValidAmount ? (
                          <span role="alert">This rental has an invalid payment amount.</span>
                        ) : canPayWithWallet ? (
                          <button
                            className="btn btn-primary"
                            type="button"
                            onClick={() => void handlePayAndCheckout(rental.id)}
                            disabled={isPayingWithWallet || isCheckingOut}
                          >
                            Pay with wallet &amp; checkout
                          </button>
                        ) : canPayWithMomo ? (
                          <button
                            className="btn btn-primary"
                            type="button"
                            onClick={() => void handleMomoPayment(rental.id)}
                            disabled={isStartingMomo || isPayingWithWallet || isCheckingOut}
                          >
                            {isStartingMomo ? 'Connecting…' : 'Pay with MoMo'}
                          </button>
                        ) : (
                          <span>MoMo requires a positive whole-number VND amount.</span>
                        )
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default RentalHistory;

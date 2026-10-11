import { Link } from 'react-router-dom';
import {
  useGetUserPaymentsQuery,
} from '../../services/paymentService';
import { useGetUserRentalsQuery } from '../../services/rentalService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatCurrency } from '../../utils/formatCurrency';

function TransactionHistory() {
  const { data: payments = [], isLoading, error } = useGetUserPaymentsQuery(
    undefined,
    { refetchOnMountOrArgChange: true },
  );
  const rentalsQuery = useGetUserRentalsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  if (isLoading || rentalsQuery.isLoading) {
    return <p role="status">Loading transaction history…</p>;
  }
  if (error || rentalsQuery.error) {
    return (
      <p role="alert">
        {getApiErrorMessage(error ?? rentalsQuery.error, 'Could not load transactions.')}
      </p>
    );
  }
  const rentalsById = new Map((rentalsQuery.data ?? []).map((rental) => [rental.id, rental]));

  return (
    <section id="transaction-history-page">
      <h2 className="section-title">Transaction History</h2>
      {!payments.length ? (
        <p>No payments yet. Your completed rental payments will appear here.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Book</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{new Date(payment.transaction_date).toLocaleDateString()}</td>
                  <td>{rentalsById.has(payment.rental_id) ? (
                    <Link to={`/book/${rentalsById.get(payment.rental_id)?.book.id}`}>
                      {rentalsById.get(payment.rental_id)?.book.title}
                    </Link>
                  ) : `Rental ${payment.rental_id.slice(0, 8)}`}</td>
                  <td>Rental</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>{payment.payment_method.replaceAll('_', ' ')}</td>
                  <td>{payment.status.replaceAll('_', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default TransactionHistory;

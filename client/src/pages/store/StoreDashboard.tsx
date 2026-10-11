import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useApproveBookHandoverMutation,
  useGetStoreInventoryQuery,
} from '../../services/storeService';
import { useGetUserProfileQuery } from '../../services/profileService';
import { getApiErrorMessage } from '../../utils/apiError';
import {
  Rental,
  useApproveRentalRequestMutation,
  useGetStoreRentalRequestsQuery,
  useRejectRentalRequestMutation,
} from '../../services/rentalService';
import { formatCurrency } from '../../utils/formatCurrency';

const filters = ['ALL', 'AVAILABLE', 'RENTED', 'PENDING_APPROVAL'];

function StoreDashboard() {
  const { data: profile, isLoading: isProfileLoading, error: profileError } =
    useGetUserProfileQuery();
  const storeId = profile?.stores[0]?.id;
  const {
    data: inventory,
    isLoading: isInventoryLoading,
    error: inventoryError,
  } = useGetStoreInventoryQuery(storeId ?? '', { skip: !storeId });
  const {
    data: rentalRequests = [],
    isLoading: areRentalRequestsLoading,
    error: rentalRequestsError,
  } = useGetStoreRentalRequestsQuery();
  const [approveRentalRequest, { isLoading: isApprovingRental }] =
    useApproveRentalRequestMutation();
  const [rejectRentalRequest, { isLoading: isRejectingRental }] =
    useRejectRentalRequestMutation();
  const [approveBookHandover, { isLoading: isApprovingHandover }] =
    useApproveBookHandoverMutation();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [rentalActionError, setRentalActionError] = useState('');
  const [rentalActionMessage, setRentalActionMessage] = useState('');
  const [processingRentalId, setProcessingRentalId] = useState<string | null>(null);
  const [handoverActionError, setHandoverActionError] = useState('');
  const [handoverActionMessage, setHandoverActionMessage] = useState('');
  const [processingHandoverBookId, setProcessingHandoverBookId] =
    useState<string | null>(null);
  const isProcessingRental = isApprovingRental || isRejectingRental;
  const books = inventory ?? profile?.books ?? [];
  const visibleBooks = activeFilter === 'ALL'
    ? books
    : books.filter((book) => book.status.toUpperCase() === activeFilter);
  const availableCount = books.filter(
    (book) => book.status === 'AVAILABLE' && book.copies > 0,
  ).length;
  const rentedCount = books.filter((book) => book.status === 'RENTED').length;
  const pendingBooks = books.filter(
    (book) => book.status === 'PENDING_APPROVAL',
  );
  const pendingRentalRequests = rentalRequests.filter(
    (rental) => rental.status.toUpperCase() === 'PENDING',
  );

  if (isProfileLoading || isInventoryLoading || areRentalRequestsLoading) {
    return <p role="status">Loading store dashboard…</p>;
  }
  if (profileError || inventoryError || rentalRequestsError) {
    return (
      <p role="alert">
        {getApiErrorMessage(
          profileError ?? inventoryError ?? rentalRequestsError,
          'Could not load the store dashboard.',
        )}
      </p>
    );
  }
  if (!profile) {
    return <p role="alert">Sign in again to load your inventory.</p>;
  }

  async function handleRentalDecision(rental: Rental, decision: 'approve' | 'reject') {
    setRentalActionError('');
    setRentalActionMessage('');
    setProcessingRentalId(rental.id);
    try {
      if (decision === 'approve') {
        await approveRentalRequest(rental.id).unwrap();
        setRentalActionMessage(`Approved the request for ${rental.book.title}.`);
      } else {
        await rejectRentalRequest(rental.id).unwrap();
        setRentalActionMessage(`Rejected the request for ${rental.book.title}.`);
      }
    } catch (requestError: unknown) {
      setRentalActionError(
        getApiErrorMessage(requestError, 'Could not update this rental request.'),
      );
    } finally {
      setProcessingRentalId(null);
    }
  }

  async function handleApproveHandover(bookId: string) {
    if (!storeId) {
      return;
    }
    setHandoverActionError('');
    setHandoverActionMessage('');
    setProcessingHandoverBookId(bookId);
    try {
      const book = await approveBookHandover({ storeId, bookId }).unwrap();
      setHandoverActionMessage(`${book.title} is now available in your store.`);
    } catch (requestError: unknown) {
      setHandoverActionError(
        getApiErrorMessage(requestError, 'Could not approve this book handover.'),
      );
    } finally {
      setProcessingHandoverBookId(null);
    }
  }

  return (
    <section id="store-dashboard-page">
      <h2 className="section-title">Store Manager Dashboard</h2>
      {!storeId && (
        <p>
          No store is linked to this account. You can review your submitted books below,
          but rental requests and inventory management require a linked store.
          <Link to="/lend-book"> Lend a book</Link>
        </p>
      )}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-label">Total Books</div>
          <div className="stat-value">{books.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Available Books</div>
          <div className="stat-value">{availableCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Rented Books</div>
          <div className="stat-value">{rentedCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Approvals</div>
          <div className="stat-value">{pendingBooks.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Rental Requests</div>
          <div className="stat-value">{pendingRentalRequests.length}</div>
        </div>
      </div>

      {rentalActionError && (
        <p className="book-detail-error" role="alert">{rentalActionError}</p>
      )}
      {rentalActionMessage && (
        <p className="notification" role="status">{rentalActionMessage}</p>
      )}
      {handoverActionError && (
        <p className="book-detail-error" role="alert">{handoverActionError}</p>
      )}
      {handoverActionMessage && (
        <p className="notification" role="status">{handoverActionMessage}</p>
      )}

      <div className="section-title">Pending Rental Requests</div>
      {pendingRentalRequests.length ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Store</th>
                <th>Renter</th>
                <th>Requested dates</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Decision</th>
              </tr>
            </thead>
            <tbody>
              {pendingRentalRequests.map((rental) => (
                <tr key={rental.id}>
                  <td>
                    <Link to={`/book/${rental.book.id}`}>{rental.book.title}</Link>
                    <div className="store-rental-subtext">{rental.book.author}</div>
                  </td>
                  <td>{rental.store?.name ?? 'Store'}</td>
                  <td>{rental.renter?.fullName ?? 'Account unavailable'}</td>
                  <td>
                    {new Date(rental.rental_start_date).toLocaleDateString()}
                    {' – '}
                    {new Date(rental.rental_due_date).toLocaleDateString()}
                  </td>
                  <td>{formatCurrency(rental.total_amount)}</td>
                  <td>{rental.payment_status.replaceAll('_', ' ').toLowerCase()}</td>
                  <td>
                    <div className="store-rental-actions">
                      <button
                        className="btn btn-success"
                        type="button"
                        disabled={isProcessingRental}
                        onClick={() => void handleRentalDecision(rental, 'approve')}
                      >
                        {processingRentalId === rental.id && isApprovingRental
                          ? 'Approving…'
                          : 'Approve'}
                      </button>
                      <button
                        className="btn btn-danger"
                        type="button"
                        disabled={isProcessingRental}
                        onClick={() => void handleRentalDecision(rental, 'reject')}
                      >
                        {processingRentalId === rental.id && isRejectingRental
                          ? 'Rejecting…'
                          : 'Reject'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="store-empty-state">There are no pending rental requests.</p>
      )}

      <div className="section-title">Books in {profile.stores[0]?.name ?? 'Your Listings'}</div>
      <div className="tabs" role="group" aria-label="Filter books by status">
        {filters.map((filter) => (
          <button
            className={`tab ${activeFilter === filter ? 'active' : ''}`}
            type="button"
            key={filter}
            aria-pressed={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
          >
            {filter === 'ALL' ? 'All Books' : filter.replaceAll('_', ' ').toLowerCase()}
          </button>
        ))}
      </div>
      {!visibleBooks.length ? (
        <p>No books match this filter.</p>
      ) : (
        <div className="book-grid">
          {visibleBooks.map((book) => (
            <div className="book-card" key={book.id}>
              <div className="book-cover">
                <div className={`book-status status-${book.status.toLowerCase()}`}>
                  {book.status.replaceAll('_', ' ').toLowerCase()}
                </div>
                <img src={book.cover_image} alt={`Cover of ${book.title}`} />
              </div>
              <div className="book-info">
                <Link className="book-title" to={`/book/${book.id}`}>{book.title}</Link>
                <div className="book-author">{book.author}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="section-title">Pending Books</div>
      {pendingBooks.length ? (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Title</th><th>Author</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {pendingBooks.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>Awaiting approval</td>
                  <td>
                    {storeId ? (
                      <button
                        className="btn btn-success"
                        type="button"
                        disabled={isApprovingHandover}
                        onClick={() => void handleApproveHandover(book.id)}
                      >
                        {processingHandoverBookId === book.id && isApprovingHandover
                          ? 'Approving…'
                          : 'Approve handover'}
                      </button>
                    ) : (
                      'A store must be linked to approve books.'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No books are waiting for approval.</p>
      )}
    </section>
  );
}

export default StoreDashboard;

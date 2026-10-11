import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useApproveBookMutation,
  useGetAdminDashboardQuery,
  useGetManagedBooksQuery,
  useRejectBookMutation,
} from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/apiError';

function AdminDashboard() {
  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useGetAdminDashboardQuery();
  const {
    data: books = [],
    isLoading: areBooksLoading,
    error: booksError,
  } = useGetManagedBooksQuery();
  const [approveBook, { isLoading: isApproving }] = useApproveBookMutation();
  const [rejectBook, { isLoading: isRejecting }] = useRejectBookMutation();
  const [processingBookId, setProcessingBookId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const isProcessing = isApproving || isRejecting;
  const pendingBooks = books.filter(
    (book) => book.status.toUpperCase() === 'PENDING_APPROVAL',
  );

  if (isDashboardLoading || areBooksLoading) {
    return <p role="status">Loading admin dashboard…</p>;
  }
  if (dashboardError || booksError) {
    return (
      <p role="alert">
        {getApiErrorMessage(
          dashboardError ?? booksError,
          'Could not load the admin dashboard.',
        )}
      </p>
    );
  }
  if (!dashboard) {
    return <p role="alert">Could not load admin dashboard statistics.</p>;
  }

  async function handleBookDecision(bookId: string, decision: 'approve' | 'reject') {
    setActionError('');
    setActionMessage('');
    setProcessingBookId(bookId);
    try {
      if (decision === 'approve') {
        await approveBook(bookId).unwrap();
        setActionMessage('Book approved and made available.');
      } else {
        await rejectBook(bookId).unwrap();
        setActionMessage('Book submission rejected.');
      }
    } catch (requestError: unknown) {
      setActionError(getApiErrorMessage(requestError, 'Could not update this book.'));
    } finally {
      setProcessingBookId(null);
    }
  }

  const stats = [
    { label: 'Total Users', value: dashboard.users },
    { label: 'Total Books', value: dashboard.books },
    { label: 'Pending Books', value: dashboard.pendingBooks },
    { label: 'Pending Transfers', value: dashboard.pendingTransfers },
    { label: 'Open Disputes', value: dashboard.openDisputes },
  ];

  return (
    <section id="admin-dashboard-page">
      <h2 className="section-title">Admin Dashboard</h2>
      <p className="form-subtitle">Operations overview for the BookHive platform.</p>

      <div className="dashboard-stats">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {actionError && <p className="book-detail-error" role="alert">{actionError}</p>}
      {actionMessage && <p className="notification" role="status">{actionMessage}</p>}

      <div className="section-title">Books waiting for approval</div>
      {pendingBooks.length ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Owner</th>
                <th>Store</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingBooks.map((book) => (
                <tr key={book.id}>
                  <td>
                    <strong>{book.title}</strong>
                    <div className="store-rental-subtext">{book.author} · {book.genre}</div>
                  </td>
                  <td>
                    {book.owner?.fullName ?? 'Account unavailable'}
                    {book.owner?.email && (
                      <div className="store-rental-subtext">{book.owner.email}</div>
                    )}
                  </td>
                  <td>{book.store?.name ?? 'Not assigned'}</td>
                  <td>{new Date(book.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="store-rental-actions">
                      <button
                        className="btn btn-success"
                        type="button"
                        disabled={isProcessing}
                        onClick={() => void handleBookDecision(book.id, 'approve')}
                      >
                        {processingBookId === book.id && isApproving
                          ? 'Approving…'
                          : 'Approve'}
                      </button>
                      <button
                        className="btn btn-danger"
                        type="button"
                        disabled={isProcessing}
                        onClick={() => void handleBookDecision(book.id, 'reject')}
                      >
                        {processingBookId === book.id && isRejecting
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
        <p className="store-empty-state">There are no books waiting for approval.</p>
      )}

      <div className="form-note">
        <Link to="/">Return to homepage</Link>
      </div>
    </section>
  );
}

export default AdminDashboard;

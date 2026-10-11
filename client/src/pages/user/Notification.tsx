import { useState } from 'react';
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '../../services/notificationService';
import { getApiErrorMessage } from '../../utils/apiError';

function Notification() {
  const { data: notifications = [], isLoading, error } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [actionError, setActionError] = useState('');

  async function handleMarkRead(id: string) {
    setActionError('');
    try {
      await markRead(id).unwrap();
    } catch (requestError: unknown) {
      setActionError(getApiErrorMessage(requestError, 'Could not update notification.'));
    }
  }

  async function handleMarkAllRead() {
    setActionError('');
    try {
      await markAllRead().unwrap();
    } catch (requestError: unknown) {
      setActionError(getApiErrorMessage(requestError, 'Could not update notifications.'));
    }
  }

  if (isLoading) return <p role="status">Loading notifications…</p>;
  if (error) {
    return <p role="alert">{getApiErrorMessage(error, 'Could not load notifications.')}</p>;
  }

  return (
    <section aria-labelledby="notifications-heading">
      <div className="form-container">
        <div className="form-actions">
          <h3 id="notifications-heading">Notifications</h3>
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll || !notifications.some(({ status }) => status !== 'READ')}
          >
            {isMarkingAll ? 'Updating…' : 'Mark all as read'}
          </button>
        </div>
        {actionError && <p className="book-detail-error" role="alert">{actionError}</p>}
        {!notifications.length && <p>You have no notifications.</p>}
        {notifications.map((notification) => (
          <article className="notification-item" key={notification.id}>
            <p>{notification.message}</p>
            <small>
              {notification.type.replaceAll('_', ' ')} ·{' '}
              {new Date(notification.created_at).toLocaleString()}
            </small>
            {notification.status !== 'READ' && (
              <button
                className="btn"
                type="button"
                onClick={() => void handleMarkRead(notification.id)}
              >
                Mark as read
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default Notification;

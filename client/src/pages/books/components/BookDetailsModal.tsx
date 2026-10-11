import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

type BookDetailsModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

function BookDetailsModal({ title, onClose, children }: BookDetailsModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="book-details-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="book-details-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          className="book-details-modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          autoFocus
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            width="18"
            height="18"
            focusable="false"
          >
            <path d="m5 5 10 10M15 5 5 15" />
          </svg>
        </button>
        {children}
      </section>
    </div>,
    document.body,
  );
}

export default BookDetailsModal;

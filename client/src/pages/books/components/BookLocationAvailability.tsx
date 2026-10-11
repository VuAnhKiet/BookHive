import { useMemo, useState } from 'react';
import { Book, Hub } from '../../../types/book';
import BookDetailsModal from './BookDetailsModal';

type BookLocationAvailabilityProps = {
  book: Book;
  hubs: Hub[];
  selectedLocation: string;
  onLocationChange: (location: string) => void;
};

function normalizeLocation(location: string): string {
  return location.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

function BookLocationAvailability({
  book,
  hubs,
  selectedLocation,
  onLocationChange,
}: BookLocationAvailabilityProps) {
  const [isOpen, setIsOpen] = useState(false);
  const locations = useMemo(
    () =>
      Array.from(
        new Map(
          hubs
            .filter((hub) => hub.location.trim())
            .map((hub) => [normalizeLocation(hub.location), hub.location.trim()]),
        ).values(),
      ).sort((first, second) => first.localeCompare(second)),
    [hubs],
  );

  const localHub = hubs
    .filter(
      (hub) => normalizeLocation(hub.location) === normalizeLocation(selectedLocation),
    )
    .sort((first, second) => first.name.localeCompare(second.name))[0];
  const isBookLocal =
    !!book.store &&
    !!selectedLocation &&
    normalizeLocation(book.store.location) === normalizeLocation(selectedLocation);
  const isAvailable = book.status === 'AVAILABLE' && book.copies > 0;

  return (
    <>
      <button
        className="btn book-action-secondary book-location-check-trigger"
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
      >
        Check availability
      </button>
      {isOpen && (
        <BookDetailsModal
          title="Check availability near you"
          onClose={() => setIsOpen(false)}
        >
          <section className="book-location-check" aria-labelledby="book-location-heading">
            <h2 id="book-location-heading">Check availability near you</h2>
            <label htmlFor="reader-area">Choose your area</label>
            <select
              id="reader-area"
              value={selectedLocation}
              onChange={(event) => onLocationChange(event.target.value)}
            >
              <option value="">Select an area</option>
              {locations.map((location) => (
                <option key={normalizeLocation(location)} value={location}>
                  {location}
                </option>
              ))}
            </select>

            {!selectedLocation && (
              <p>Select your area to see whether this book is at a local hub.</p>
            )}
            {selectedLocation && !localHub && (
              <p>No hub is listed in {selectedLocation} yet.</p>
            )}
            {selectedLocation && localHub && !isAvailable && (
              <p>This book is not currently available to request.</p>
            )}
            {selectedLocation && localHub && isAvailable && isBookLocal && book.store && (
              <div className="book-location-result" role="status">
                <strong>This book is available at your local hub.</strong>
                <span>{book.store.name} — {book.store.location}</span>
                <span>You can request it for pickup at this hub.</span>
              </div>
            )}
            {selectedLocation && localHub && isAvailable && !isBookLocal && book.store && (
              <div className="book-location-result" role="status">
                <strong>This book is at another hub.</strong>
                <span>Book location: {book.store.name} — {book.store.location}</span>
                <span>Your selected local hub: {localHub.name} — {localHub.location}</span>
                <span>
                  Request the rental first. After it is approved and paid, request delivery
                  to your selected local hub.
                </span>
              </div>
            )}
            {selectedLocation && isAvailable && !book.store && (
              <p>This book is not assigned to a hub yet.</p>
            )}
          </section>
        </BookDetailsModal>
      )}
    </>
  );
}

export default BookLocationAvailability;

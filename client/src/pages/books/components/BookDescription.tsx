import { useState } from 'react';

const PREVIEW_LENGTH = 280;

function getPreview(description: string): string {
  const characters = Array.from(description);
  if (characters.length <= PREVIEW_LENGTH) {
    return description;
  }

  let end = PREVIEW_LENGTH;
  while (end > 0 && !/\s/.test(characters[end])) {
    end -= 1;
  }

  return characters.slice(0, end || PREVIEW_LENGTH).join('').trimEnd();
}

function BookDescription({ description }: { description: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const trimmedDescription = description.trim();
  const preview = getPreview(trimmedDescription);
  const canExpand = preview.length < trimmedDescription.length;

  return (
    <div className="book-description">
      <h3>Description</h3>
      <p>
        {isExpanded || !canExpand ? trimmedDescription : `${preview}… `}
        {canExpand && (
          <button
            className="book-description-toggle"
            type="button"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded((expanded) => !expanded)}
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </p>
    </div>
  );
}

export default BookDescription;

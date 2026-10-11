import { Review } from '../../../types/book';

type BookReviewsProps = {
  reviews: Review[];
};

function BookReviews({ reviews }: BookReviewsProps) {
  return (
    <section className="reviews" aria-labelledby="reviews-heading">
      <h3 id="reviews-heading" className="section-title">
        Reviews
      </h3>
      {!reviews.length && (
        <p>No reviews have been submitted for this book yet.</p>
      )}
      {reviews.map((review) => (
        <article className="review" key={review.id}>
          <div className="review-rating" aria-label={`${review.rating} out of 5 stars`}>
            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
          </div>
          <strong>{review.renter.fullName}</strong>
          <p>{review.comment}</p>
          {review.created_at && (
            <small>{new Date(review.created_at).toLocaleDateString()}</small>
          )}
        </article>
      ))}
    </section>
  );
}

export default BookReviews;

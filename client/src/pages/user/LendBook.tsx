import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useAddBookToStoreMutation,
  useGetStoresQuery,
} from '../../services/storeService';
import { useCreateLendBookMutation } from '../../services/bookService';
import { getApiErrorMessage } from '../../utils/apiError';

function LendBook() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [rentalPrice, setRentalPrice] = useState('');
  const [condition, setCondition] = useState('NEW');
  const [storeId, setStoreId] = useState('');
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');
  const [createLendBook, { isLoading }] = useCreateLendBookMutation();
  const [addBookToStore, { isLoading: isAssigning }] = useAddBookToStoreMutation();
  const { data: stores = [], isLoading: isLoadingStores, error: storesError } =
    useGetStoresQuery();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setMessage('');
    try {
      const book = await createLendBook({
        title,
        author,
        genre,
        description,
        cover_image: coverImage,
        rental_price_per_day: Number(rentalPrice),
        condition,
      }).unwrap();
      if (storeId) {
        try {
          await addBookToStore({ storeId, bookId: book.id }).unwrap();
        } catch (assignmentError: unknown) {
          setMessage(`${book.title} was created. Its ID is ${book.id}.`);
          setFormError(
            `${book.title} was created, but could not be assigned to the selected store: ${
              getApiErrorMessage(assignmentError, 'Store assignment failed.')
            }`,
          );
          setTitle('');
          setAuthor('');
          setGenre('');
          setDescription('');
          setCoverImage('');
          setRentalPrice('');
          setCondition('NEW');
          setStoreId('');
          return;
        }
      }
      setMessage(
        storeId
          ? `${book.title} was submitted to ${stores.find((store) => store.id === storeId)?.name ?? 'the selected store'} for approval.`
          : `${book.title} was submitted without a store, so it will not appear in a store manager’s dashboard.`,
      );
      setTitle('');
      setAuthor('');
      setGenre('');
      setDescription('');
      setCoverImage('');
      setRentalPrice('');
      setCondition('NEW');
      setStoreId('');
    } catch (requestError: unknown) {
      setFormError(getApiErrorMessage(requestError, 'Could not submit this book.'));
    }
  }

  return (
    <section id="lend-book-page">
      <form className="form-container" onSubmit={handleSubmit}>
        <h2 className="form-title">Lend a Book</h2>
        <div className="form-group">
          <label htmlFor="title">Book Title</label>
          <input id="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="author">Author</label>
          <input id="author" value={author} onChange={(event) => setAuthor(event.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="genre">Genre</label>
          <input id="genre" value={genre} onChange={(event) => setGenre(event.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Book Description</label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="cover-image">Cover Image URL</label>
          <input
            id="cover-image"
            type="url"
            value={coverImage}
            onChange={(event) => setCoverImage(event.target.value)}
            placeholder="https://example.com/book-cover.jpg"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="rental-price">Rental price per day</label>
          <input
            id="rental-price"
            type="number"
            min="0.01"
            step="0.01"
            value={rentalPrice}
            onChange={(event) => setRentalPrice(event.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="store">Send to a store (optional)</label>
          <select
            id="store"
            value={storeId}
            onChange={(event) => setStoreId(event.target.value)}
            disabled={isLoadingStores}
          >
            <option value="">Submit without a store</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} — {store.location}
              </option>
            ))}
          </select>
          {storesError && (
            <p role="alert">{getApiErrorMessage(storesError, 'Could not load stores.')}</p>
          )}
          <p className="form-note">
            Choose a store to send the book to that store manager’s dashboard.
            If you submit without a store, it will not appear in any store dashboard.
          </p>
        </div>
        <div className="form-group">
          <label htmlFor="condition">Book Condition</label>
          <select
            id="condition"
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
          >
            <option value="NEW">New</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="POOR">Poor</option>
          </select>
        </div>
        {formError && <p className="book-detail-error" role="alert">{formError}</p>}
        {message && <p role="status">{message} <Link to="/user-dashboard">View dashboard</Link></p>}
        <div className="form-actions">
          <button
            className="btn"
            type="button"
            onClick={() => {
              setTitle('');
              setAuthor('');
              setGenre('');
              setDescription('');
              setCoverImage('');
              setRentalPrice('');
              setCondition('NEW');
              setStoreId('');
              setFormError('');
              setMessage('');
            }}
          >
            Clear
          </button>
          <button className="btn btn-success" type="submit" disabled={isLoading || isAssigning}>
            {isLoading || isAssigning ? 'Submitting…' : 'Submit Book'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default LendBook;

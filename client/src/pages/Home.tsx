import './Home.css';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useGetBooksQuery, useSearchBooksQuery } from '../services/bookService';
import { getApiErrorMessage } from '../utils/apiError';

const visibleCount = 6;

function Home() {
    const [searchParams] = useSearchParams();
    const searchTerm = (searchParams.get('search') ?? '').trim();
    const booksQuery = useGetBooksQuery(undefined, { skip: !!searchTerm });
    const searchQuery = useSearchBooksQuery(searchTerm, { skip: !searchTerm });
    const books = searchTerm
        ? searchQuery.data ?? []
        : booksQuery.data ?? [];
    const isLoading = searchTerm
        ? searchQuery.isLoading || searchQuery.isFetching
        : booksQuery.isLoading || booksQuery.isFetching;
    const error = searchTerm ? searchQuery.error : booksQuery.error;
    const [pageIndex, setPageIndex] = useState(0);
    const availableBooks = books.filter(
        (book) => book.status === 'AVAILABLE' && book.copies > 0,
    );
    const recentBooks = [...availableBooks]
        .sort((first, second) => {
            const firstDate = first.created_at ? new Date(first.created_at).getTime() : 0;
            const secondDate = second.created_at ? new Date(second.created_at).getTime() : 0;
            return secondDate - firstDate;
        })
        .slice(0, 4);
    const categories = Array.from(
        new Set(books.map((book) => book.genre.trim()).filter(Boolean)),
    ).sort((first, second) => first.localeCompare(second));

    const totalPages = Math.ceil(availableBooks.length / visibleCount);
    const currentPage = totalPages ? pageIndex % totalPages : 0;

    const handlePrev = () => {
        setPageIndex((currentPage + totalPages - 1) % totalPages);
    };

    const handleNext = () => {
        setPageIndex((currentPage + 1) % totalPages);
    };

    const startIndex = currentPage * visibleCount;

    const visibleBooks = availableBooks.slice(startIndex, startIndex + visibleCount);
    return (
        <div>
            <section id="home-page" >
                <div className="section-title">
                    {searchTerm ? `Search results for “${searchTerm}”` : 'Featured Books'}
                </div>
                {isLoading ? (
                    <p role="status">Loading books…</p>
                ) : error ? (
                    <p role="alert">{getApiErrorMessage(error, 'Could not load books. Please try again later.')}</p>
                ) : (
                    <>
                        {availableBooks.length > visibleCount && (
                            <div className="carousel-controls spaced">
                                <button onClick={handlePrev} className="carousel-btn">❮ Prev</button>
                                <button onClick={handleNext} className="carousel-btn">Next ❯</button>
                            </div>
                        )}
                        {visibleBooks.length ? (
                            <div className="book-grid">
                                {visibleBooks.map((book) => (
                                    <div className="book-card" key={book.id}>
                                        <div className="book-cover">
                                            <div className="book-status status-available">Available</div>
                                            <img src={book.cover_image} alt={`Cover of ${book.title}`} />
                                        </div>
                                        <div className="book-info">
                                            <div className="book-title">{book.title}</div>
                                            <div className="book-author">{book.author}</div>
                                            <Link className="btn" to={`/book/${book.id}`}>Rent Now</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No available books right now.</p>
                        )}
                    </>
                )}

                {!searchTerm && <div className="section-title">Browse by Category</div>}

                {!searchTerm && !isLoading && !error && (
                    <div className="categories">
                        {categories.map((category) => (
                            <Link
                                className="category"
                                key={category}
                                to={`/?search=${encodeURIComponent(category)}`}
                            >
                                {category}
                            </Link>
                        ))}
                        {!categories.length && <p>No book categories available.</p>}
                    </div>
                )}

                {!searchTerm && <div className="section-title">Recently Added</div>}

                {!searchTerm && isLoading ? (
                    <p role="status">Loading books…</p>
                ) : !searchTerm && !error && (
                    <div className="book-grid">
                        {recentBooks.map((book) => (
                            <div className="book-card" key={book.id}>
                                <div className="book-cover">
                                    <div className="book-status status-available">Available</div>
                                    <img src={book.cover_image} alt={`Cover of ${book.title}`} />
                                </div>
                                <div className="book-info">
                                    <div className="book-title">{book.title}</div>
                                    <div className="book-author">{book.author}</div>
                                    <Link className="btn" to={`/book/${book.id}`}>Rent Now</Link>
                                </div>
                            </div>
                        ))}
                        {!recentBooks.length && <p>No recent books available.</p>}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="pagination">
                        <button type="button" onClick={handlePrev}>«</button>
                        {Array.from({ length: totalPages }, (_, page) => (
                            <button
                                className={page === currentPage ? 'active' : ''}
                                type="button"
                                key={page}
                                aria-current={page === currentPage ? 'page' : undefined}
                                onClick={() => setPageIndex(page)}
                            >
                                {page + 1}
                            </button>
                        ))}
                        <button type="button" onClick={handleNext}>»</button>
                    </div>
                )}
            </section>
        </div>
    )
}

export default Home
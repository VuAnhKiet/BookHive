import React, { useState } from 'react'
const featuredBooks = [
    {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        img: 'https://i.ebayimg.com/images/g/cgYAAOSwuTxWBAcx/s-l1600.webp',
    },
    {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        img: '/api/placeholder/200/250',
    },
    {
        title: '1984',
        author: 'George Orwell',
        img: '/api/placeholder/200/250',
    },
    {
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        img: '/api/placeholder/200/250',
    },
    {
        title: 'Brave New World',
        author: 'Aldous Huxley',
        img: '/api/placeholder/200/250',
    },
    {
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        img: '/api/placeholder/200/250',
    },
    {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        img: '/api/placeholder/200/250',
    },
    {
        title: 'The Lord of the Rings',
        author: 'J.R.R. Tolkien',
        img: '/api/placeholder/200/250',
    },
]

const visibleCount = 6;

function Home() {
    const [pageIndex, setPageIndex] = useState(0);

const totalPages = Math.ceil(featuredBooks.length / visibleCount);

const handlePrev = () => {
    setPageIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
};

const handleNext = () => {
    setPageIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
};

const startIndex = pageIndex * visibleCount;

const visibleBooks = featuredBooks.slice(startIndex, Math.min(startIndex + visibleCount, featuredBooks.length));
    return (
        <div>
            <section id="home-page" >
                <div className="section-title">Featured Books</div>
                <div className="carousel-controls spaced">
                    <button onClick={handlePrev} className="carousel-btn">❮ Prev</button>
                    <button onClick={handleNext} className="carousel-btn">Next ❯</button>
                </div>

                <div className="book-grid">
                    {visibleBooks.map((book, index) => (
                        <div className="book-card" key={index}>
                            <div className="book-cover">
                                <div className="book-status status-available">Available</div>
                                <img src={book.img} alt="Book Cover" />
                            </div>
                            <div className="book-info">
                                <div className="book-title">{book.title}</div>
                                <div className="book-author">{book.author}</div>
                                <button className="btn">Rent Now</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="section-title">Browse by Category</div>

                <div className="categories">
                    <div className="category">Fiction</div>
                    <div className="category">Non-Fiction</div>
                    <div className="category">Mystery</div>
                    <div className="category">Science Fiction</div>
                    <div className="category">Romance</div>
                    <div className="category">Thriller</div>
                    <div className="category">Biography</div>
                    <div className="category">Self-Help</div>
                    <div className="category">History</div>
                    <div className="category">Fantasy</div>
                </div>

                <div className="section-title">Recently Added</div>

                <div className="book-grid">
                    <div className="book-card">
                        <div className="book-cover">
                            <div className="book-status status-available">Available</div>
                            <img src="/api/placeholder/200/250" alt="Book Cover" />
                        </div>
                        <div className="book-info">
                            <div className="book-title">Brave New World</div>
                            <div className="book-author">Aldous Huxley</div>
                            <button className="btn">Rent Now</button>
                        </div>
                    </div>

                    <div className="book-card">
                        <div className="book-cover">
                            <div className="book-status status-available">Available</div>
                            <img src="/api/placeholder/200/250" alt="Book Cover" />
                        </div>
                        <div className="book-info">
                            <div className="book-title">The Hobbit</div>
                            <div className="book-author">J.R.R. Tolkien</div>
                            <button className="btn">Rent Now</button>
                        </div>
                    </div>

                    <div className="book-card">
                        <div className="book-cover">
                            <div className="book-status status-available">Available</div>
                            <img src="/api/placeholder/200/250" alt="Book Cover" />
                        </div>
                        <div className="book-info">
                            <div className="book-title">Pride and Prejudice</div>
                            <div className="book-author">Jane Austen</div>
                            <button className="btn">Rent Now</button>
                        </div>
                    </div>

                    <div className="book-card">
                        <div className="book-cover">
                            <div className="book-status status-available">Available</div>
                            <img src="/api/placeholder/200/250" alt="Book Cover" />
                        </div>
                        <div className="book-info">
                            <div className="book-title">The Lord of the Rings</div>
                            <div className="book-author">J.R.R. Tolkien</div>
                            <button className="btn">Rent Now</button>
                        </div>
                    </div>
                </div>

                <div className="pagination">
                    <button>«</button>
                    <button className="active">1</button>
                    <button>2</button>
                    <button>3</button>
                    <button>»</button>
                </div>
            </section>
        </div>
    )
}

export default Home
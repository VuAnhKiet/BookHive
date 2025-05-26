import React from 'react'

function UserDashboard() {
  return (
    <div>
        <section id="dashboard">
            <h2 className="section-title">Dashboard</h2>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-value">12</div>
                    <div className="stat-label">Currently Borrowed</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">87</div>
                    <div className="stat-label">Books Read</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">4.2</div>
                    <div className="stat-label">Average Rating</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">24</div>
                    <div className="stat-label">On Wishlist</div>
                </div>
            </div>

            <h3 className="section-title">Current Rentals</h3>
            <div className="current-rentals">
                <div className="rental-item">
                    <div className="rental-cover"></div>
                    <div className="rental-info">
                        <div className="rental-title">The Great Gatsby</div>
                        <div className="rental-author">F. Scott Fitzgerald</div>
                        <div className="rental-date">Due: April 15, 2025</div>
                    </div>
                    <div className="rental-actions">
                        <button className="btn btn-primary">Extend</button>
                    </div>
                </div>

                <div className="rental-item">
                    <div className="rental-cover"></div>
                    <div className="rental-info">
                        <div className="rental-title">To Kill a Mockingbird</div>
                        <div className="rental-author">Harper Lee</div>
                        <div className="rental-date">Due: April 10, 2025</div>
                    </div>
                    <div className="rental-actions">
                        <button className="btn btn-primary">Extend</button>
                    </div>
                </div>

                <div className="rental-item">
                    <div className="rental-cover"></div>
                    <div className="rental-info">
                        <div className="rental-title">1984</div>
                        <div className="rental-author">George Orwell</div>
                        <div className="rental-date">Due: April 20, 2025</div>
                    </div>
                    <div className="rental-actions">
                        <button className="btn btn-primary">Extend</button>
                    </div>
                </div>
            </div>

            <h3 className="section-title">Reading History</h3>
            <div className="book-grid">
                <div className="book-card">
                    <div className="book-cover"></div>
                    <div className="book-info">
                        <div className="book-title">Pride and Prejudice</div>
                        <div className="book-author">Jane Austen</div>
                        <div className="book-rating">★★★★☆</div>
                    </div>
                </div>

                <div className="book-card">
                    <div className="book-cover"></div>
                    <div className="book-info">
                        <div className="book-title">Brave New World</div>
                        <div className="book-author">Aldous Huxley</div>
                        <div className="book-rating">★★★★★</div>
                    </div>
                </div>

                <div className="book-card">
                    <div className="book-cover"></div>
                    <div className="book-info">
                        <div className="book-title">The Catcher in the Rye</div>
                        <div className="book-author">J.D. Salinger</div>
                        <div className="book-rating">★★★☆☆</div>
                    </div>
                </div>

                <div className="book-card">
                    <div className="book-cover"></div>
                    <div className="book-info">
                        <div className="book-title">Lord of the Flies</div>
                        <div className="book-author">William Golding</div>
                        <div className="book-rating">★★★★☆</div>
                    </div>
                </div>
            </div>
        </section>
    </div>
  )
}

export default UserDashboard
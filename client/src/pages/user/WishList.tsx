import React from 'react'

function WishList() {
  return (
    <div>
        <section id="wishlist-page">
    <h2 className="section-title">My Wishlist</h2>

    <div className="book-grid">
        <div className="book-card">
            <div className="book-cover">
                <img src="/api/placeholder/200/250" alt="Book Cover" />
            </div>
            <div className="book-info">
                <div className="book-title">The Great Gatsby</div>
                <div className="book-author">F. Scott Fitzgerald</div>
                <button className="btn btn-danger">Remove</button>
            </div>
        </div>
        <div className="book-card">
            <div className="book-cover">
                <img src="/api/placeholder/200/250" alt="Book Cover"/>
            </div>
            <div className="book-info">
                <div className="book-title">To Kill a Mockingbird</div>
                <div className="book-author">Harper Lee</div>
                <button className="btn btn-danger">Remove</button>
            </div>
        </div>
    </div>
</section>

    </div>
  )
}

export default WishList
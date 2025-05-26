import React from 'react'

function BookDetails() {
  return (
    <div>
         <section id="book-details-page" >
            <div className="book-details">
                <div className="book-details-cover">
                    <img src="https://i.ebayimg.com/images/g/cgYAAOSwuTxWBAcx/s-l1600.webp" alt="Book Cover"/>
                </div>
                <div className="book-details-info">
                    <h1 className="book-details-title">The Great Gatsby</h1>
                    <div className="book-details-author">F. Scott Fitzgerald</div>
                    
                    <div className="book-availability">
                        <div className="book-status status-available">Available</div>
                        <button className="btn">Rent Now</button>
                    </div>
                    
                    <div>
                        <strong>Genre:</strong> Fiction
                    </div>
                    <div>
                        <strong>Location:</strong> Downtown Library
                    </div>
                    <div>
                        <strong>Rating:</strong> ★★★★☆ (4.2/5)
                    </div>
                    
                    <div className="book-description">
                        <h3>Description</h3>
                        <p>The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.</p>
                        <p>The novel was inspired by a youthful romance Fitzgerald had with socialite Ginevra King, and the riotous parties he attended on Long Island's North Shore in 1922. Following a move to the French Riviera, Fitzgerald completed a rough draft of the novel in 1924. He submitted it to editor Maxwell Perkins, who persuaded Fitzgerald to revise the work over the following winter.</p>
                    </div>
                </div>
            </div>
            
            <div className="reviews">
                <h3 className="section-title">Reviews</h3>
                
                <div className="review">
                    <div className="review-rating">★★★★★</div>
                    <strong>John Doe</strong>
                    <p>This is a classNameic novel that everyone should read at least once. The prose is beautiful and the story is timeless.</p>
                </div>
                
                <div className="review">
                    <div className="review-rating">★★★★☆</div>
                    <strong>Jane Smith</strong>
                    <p>I enjoyed the book very much, especially Fitzgerald's descriptive language and character development.</p>
                </div>
                
                <div className="review">
                    <div className="review-rating">★★★☆☆</div>
                    <strong>Mike Johnson</strong>
                    <p>While I appreciate its place in American literature, I found some parts to be slow-paced.</p>
                </div>
                
                <div className="form-container" style={{ marginTop: '30px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Add a Review</h3>
                    
                    <div className="form-group">
                        <label>Rating</label>
                        <select>
                            <option value="5">★★★★★ (5/5)</option>
                            <option value="4">★★★★☆ (4/5)</option>
                            <option value="3">★★★☆☆ (3/5)</option>
                            <option value="2">★★☆☆☆ (2/5)</option>
                            <option value="1">★☆☆☆☆ (1/5)</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="review-text">Your Review</label>
                        <textarea id="review-text" rows={4} placeholder="Write your review here..."></textarea>
                    </div>
                    
                    <button className="btn btn-success">Submit Review</button>
                </div>
            </div>
        </section>
    </div>
  )
}

export default BookDetails
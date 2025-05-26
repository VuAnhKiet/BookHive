import React from 'react'

function LendBook() {
  return (
    <div>
        <section id="lend-book-page" >
            <div className="form-container">
                <h2 className="form-title">Lend a Book</h2>

                <div className="form-group">
                    <label htmlFor="title">Book Title</label>
                    <input type="text" id="title" placeholder="Enter book title"/>
                </div>

                <div className="form-group">
                    <label htmlFor="author">Author</label>
                    <input type="text" id="author" placeholder="Enter author name"/>
                </div>

                <div className="form-group">
                    <label htmlFor="genre">Genre</label>
                    <select id="genre">
                        <option value="">Select Genre</option>
                        <option value="fiction">Fiction</option>
                        <option value="non-fiction">Non-Fiction</option>
                        <option value="mystery">Mystery</option>
                        <option value="sci-fi">Science Fiction</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Book Description</label>
                    <textarea id="description" rows={4} placeholder="Enter book description"></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="cover-image">Cover Image</label>
                    <input type="file" id="cover-image"/>
                </div>

                <div className="form-group">
                    <label htmlFor="store">Store</label>
                    <select id="store">
                        <option value="">Select Store</option>
                        <option value="1">Downtown Library</option>
                        <option value="2">Central Bookstore</option>
                        <option value="3">University Book Exchange</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button className="btn">Cancel</button>
                    <button className="btn btn-success">Submit Book</button>
                </div>
            </div>
        </section>
    </div>
  )
}

export default LendBook
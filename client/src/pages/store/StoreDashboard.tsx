import React from 'react'

function StoreDashboard() {
    return (
        <div>
            <section id="store-dashboard-page">
                <h2 className="section-title">Store Dashboard</h2>

                <div className="dashboard-stats">
                    <div className="stat-card">
                        <div className="stat-label">Total Books</div>
                        <div className="stat-value">248</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Available Books</div>
                        <div className="stat-value">189</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Rented Books</div>
                        <div className="stat-value">59</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Pending Approvals</div>
                        <div className="stat-value">12</div>
                    </div>
                </div>

                <div className="section-title">Books in Store</div>

                <div className="tabs">
                    <div className="tab active">All Books</div>
                    <div className="tab">Available</div>
                    <div className="tab">Rented</div>
                    <div className="tab">Pending</div>
                </div>

                <div className="book-grid">
                    <div className="book-card">
                        <div className="book-cover">
                            <div className="book-status status-available">Available</div>
                            <img src="/api/placeholder/200/250" alt="Book Cover" />
                        </div>
                        <div className="book-info">
                            <div className="book-title">The Great Gatsby</div>
                            <div className="book-author">F. Scott Fitzgerald</div>
                        </div>
                    </div>

                    <div className="book-card">
                        <div className="book-cover">
                            <div className="book-status status-rented">Rented</div>
                            <img src="/api/placeholder/200/250" alt="Book Cover" />
                        </div>
                        <div className="book-info">
                            <div className="book-title">To Kill a Mockingbird</div>
                            <div className="book-author">Harper Lee</div>
                        </div>
                    </div>

                    <div className="book-card">
                        <div className="book-cover">
                            <div className="book-status status-pending">Pending</div>
                            <img src="/api/placeholder/200/250" alt="Book Cover" />
                        </div>
                        <div className="book-info">
                            <div className="book-title">1984</div>
                            <div className="book-author">George Orwell</div>
                        </div>
                    </div>
                </div>

                <div className="section-title">Pending Books</div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Book</th>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Submitted By</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className='approve-cover'></div>
                                </td>
                                <td>The Catcher in the Rye</td>
                                <td>J.D. Salinger</td>
                                <td>john@example.com</td>
                                <td>
                                    <button className="btn btn-success">Approve</button>
                                    <button className="btn btn-danger">Reject</button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className='approve-cover'></div>
                                </td>
                                <td>Brave New World</td>
                                <td>Aldous Huxley</td>
                                <td>jane@example.com</td>
                                <td>
                                    <button className="btn btn-success">Approve</button>
                                    <button className="btn btn-danger">Reject</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}

export default StoreDashboard
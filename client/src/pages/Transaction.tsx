import React from 'react'

function Transaction() {
  return (
    <div>
        <section id="transaction-history-page" style={{ display: 'none' }}>
            <h2 className="section-title">Transaction History</h2>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Book</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Mar 20, 2025</td>
                            <td>The Great Gatsby</td>
                            <td>Rental</td>
                            <td>$10.00</td>
                            <td><span style={{ color: 'var(--success-color)' }}>Paid</span></td>
                        </tr>
                        <tr>
                            <td>Feb 15, 2025</td>
                            <td>To Kill a Mockingbird</td>
                            <td>Rental</td>
                            <td>$5.00</td>
                            <td><span style={{ color: 'var(--danger-color)' }}>Failed</span></td>
                        </tr>
                        <tr>
                            <td>Jan 30, 2025</td>
                            <td>1984</td>
                            <td>Late Fee</td>
                            <td>$2.50</td>
                            <td><span style={{ color: 'var(--success-color)' }}>Paid</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
  )
}

export default Transaction
import React from 'react'

function RentalHistory() {
  return (
    <div>
      <section id="rental-history-page">
        <h2 className="section-title">Rental History</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Title</th>
                <th>Author</th>
                <th>Rented Date</th>
                <th>Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style={{ width: '50px', height: '70px', backgroundColor: '#e0e0e0', borderRadius: '3px' }}></div>
                </td>
                <td>The Catcher in the Rye</td>
                <td>J.D. Salinger</td>
                <td>Feb 10, 2025</td>
                <td>Feb 17, 2025</td>
                <td><span style={{ color: 'var(--success-color)' }}>Returned</span></td>
              </tr>
              <tr>
                <td>
                  <div style={{ width: '50px', height: '70px', backgroundColor: '#e0e0e0', borderRadius: '3px' }}></div>
                </td>
                <td>Brave New World</td>
                <td>Aldous Huxley</td>
                <td>Jan 25, 2025</td>
                <td>Feb 1, 2025</td>
                <td><span style={{ color: 'var(--danger-color)' }}>Late</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}

export default RentalHistory
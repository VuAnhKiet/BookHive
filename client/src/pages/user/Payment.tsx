import React from 'react'

function Payment() {
  return (
    <div>
      <div className="tab-content">
        <div className="form-container">
          <h3>Saved Payment Methods</h3>

          <div className="payment-method">
            <div>
              <div className="card-name">Visa ending in 4242</div>
              <div className="card-expiry">Expires 05/2026</div>
            </div>
            <div>
              <button className="btn">Remove</button>
            </div>
          </div>

          <div className="payment-method">
            <div>
              <div className="card-name">Mastercard ending in 8353</div>
              <div className="card-expiry">Expires 11/2025</div>
            </div>
            <div>
              <button className="btn">Remove</button>
            </div>
          </div>

          <button className="btn btn-primary add-payment-btn">Add New Payment Method</button>

          <div className="billing-history">
            <h3>Billing History</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>04/01/2025</td>
                    <td>Monthly Subscription</td>
                    <td>$12.99</td>
                    <td>Paid</td>
                  </tr>
                  <tr>
                    <td>03/01/2025</td>
                    <td>Monthly Subscription</td>
                    <td>$12.99</td>
                    <td>Paid</td>
                  </tr>
                  <tr>
                    <td>02/01/2025</td>
                    <td>Monthly Subscription</td>
                    <td>$12.99</td>
                    <td>Paid</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment
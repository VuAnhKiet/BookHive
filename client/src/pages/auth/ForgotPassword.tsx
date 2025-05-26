import React from 'react'

function ForgotPassword() {
    return (
        <div>
            <section id="forgot-password-page">
                <div className="form-container">
                    <h2 className="form-title">Reset Your Password</h2>

                    <div className="form-group">
                        <label htmlFor="reset-email">Email Address</label>
                        <input type="email" id="reset-email" placeholder="Enter your email" />
                    </div>

                    <div className="form-actions" style={{ justifyContent: 'center' }}>
                        <button className="btn btn-success">Send Reset Link</button>
                    </div>

                    <div className="form-note">
                        Remember your password? <a href="#">Login</a>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ForgotPassword
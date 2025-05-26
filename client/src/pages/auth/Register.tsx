import React from 'react'

function Register() {
  return (
    <div>
        <section id="register-page">
            <div className="form-container">
                <h2 className="form-title">Create Account</h2>

                <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input type="text" id="name" placeholder="Enter your full name"/>
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" placeholder="Enter your email"/>
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" placeholder="Create a password"/>
                </div>

                <div className="form-group">
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <input type="password" id="confirm-password" placeholder="Confirm your password"/>
                </div>

                <div className="form-group">
                    <label>Account Type</label>
                    <div style={{display: "flex", gap: "10px"}}>
                        <button className="btn">Renter</button>
                        <button className="btn btn-secondary">Lender</button>
                    </div>
                </div>

                <div className="form-actions" style={{justifyContent: "center"}}>
                    <button className="btn btn-success">Create Account</button>
                </div>

                <div className="form-note">
                    Already have an account? <a href="#">Login</a>
                </div>
            </div>
        </section>
    </div>
  )
}

export default Register
import React from 'react'

function Login() {
  return (
    <div>
        <section id="login-page" >
            <div className="form-container">
                <h2 className="form-title">Login</h2>
                
                <div className="form-group">
                    <label htmlFor="login-email">Email</label>
                    <input type="email" id="login-email" placeholder="Enter your email"/>
                </div>
                
                <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <input type="password" id="login-password" placeholder="Enter your password"/>
                </div>
                
                <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '20px' }}>
                    <a href="#">Forgot Password?</a>
                </div>
                
                <div className="form-actions" style={{ justifyContent: 'center' }}>
                    <button className="btn btn-success">Login</button>
                </div>
                
                <div className="form-note">
                    Don't have an account? <a href="#">Register</a>
                </div>
            </div>
        </section>
    </div>
  )
}

export default Login
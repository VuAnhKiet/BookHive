import React from 'react'

function Header() {
    return (
        <div>
            <div className='header'>
                <div className="container header-container">
                    <div className="logo">Rent<span>&</span>Reads</div>
                    <div className="search-bar">
                        <input type="text" placeholder="Search books by title, author..." />
                        <button>🔍</button>
                    </div>
                    <div className="auth-buttons">
                        <button className="btn">Login</button>
                        <button className="btn btn-secondary">Register</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header
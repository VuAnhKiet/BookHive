import React from 'react'

function Footer() {
  return (
    <div>
        <footer>
        <div className="container">
            <div className="footer-container">
                <div className="footer-section">
                    <h3 className="footer-title">About Us</h3>
                    <ul className="footer-links">
                        <li><a href="#">Our Story</a></li>
                        <li><a href="#">Team</a></li>
                        <li><a href="#">Careers</a></li>
                        <li><a href="#">Press</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3 className="footer-title">Support</h3>
                    <ul className="footer-links">
                        <li><a href="#">FAQ</a></li>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Shipping & Returns</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3 className="footer-title">Legal</h3>
                    <ul className="footer-links">
                        <li><a href="#">Terms of Service</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Cookie Policy</a></li>
                        <li><a href="#">Accessibility</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3 className="footer-title">Connect</h3>
                    <ul className="footer-links">
                        <li><a href="#">Newsletter</a></li>
                        <li><a href="#">Facebook</a></li>
                        <li><a href="#">Twitter</a></li>
                        <li><a href="#">Instagram</a></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2025 Library Management System. All rights reserved.</p>
            </div>
        </div>
    </footer>
    </div>
  )
}

export default Footer
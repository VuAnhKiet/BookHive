import React from 'react'
import Notification from './Notification'
import Payment from './Payment'
function Profile() {
    return (
        <div>
            <section id="profile-page">
                <h2 className="section-title">Profile & Settings</h2>
                <div className="profile-header">
                    <div className="profile-picture">
                        <span>JD</span>
                    </div>
                    <div className="profile-info">
                        <h2>John Doe</h2>
                        <div className="profile-email">john@example.com</div>
                        <div style={{ marginTop: '10px' }}>
                            <button className="btn">Edit Profile</button>
                        </div>
                    </div>
                </div>
                <div className="tabs">
                    <div className="tab active">Account Settings</div>
                    <div className="tab">Notification Settings</div>
                    <div className="tab">Payment Methods</div>
                </div>
                <div className="tab-content active">
                    <div className="form-container">
                        <div className="form-group">
                            <label htmlFor="fullname">Full Name</label>
                            <input type="text" id="fullname" value="John Doe" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input type="email" id="email" value="john@example.com" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input type="tel" id="phone" value="(555) 123-4567" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">Address</label>
                            <textarea id="address">123 Main Street, Anytown, AN 12345</textarea>
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Change Password</label>
                            <input type="password" id="password" placeholder="New password" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <input type="password" id="confirm-password" placeholder="Confirm new password" />
                        </div>
                        <div className="form-actions">
                            <button className="btn">Cancel</button>
                            <button className="btn btn-primary">Save Changes</button>
                        </div>
                    </div>
                </div>
                <Notification/>
                <Payment/>
            </section>
        </div>
    )
}

export default Profile
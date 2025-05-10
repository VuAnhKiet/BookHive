import React from 'react'

function Notification() {
    return (
        <div>
            <div className="tab-content">
                <div className="form-container">
                    <div className="form-group-notification">
                        <label>
                            Email notifications for new arrivals
                        </label>
                        <input type="checkbox" />
                    </div>

                    <div className="form-group-notification">
                        <label>
                            Rental due date reminders
                        </label>
                        <input type="checkbox" />
                    </div>

                    <div className="form-group-notification" >
                        <label >Promotional offers and discounts</label>
                        <input type="checkbox" />
                    </div>

                    <div className="form-group-notification">
                        <label>
                             Book recommendations
                        </label>
                        <input type="checkbox" />
                    </div>

                    <div className="form-group-notification">
                        <label>
                             Account activity updates
                        </label>
                        <input type="checkbox" />
                    </div>

                    <div className="form-group-notification">
                        <button className="btn btn-primary">Save Preferences</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Notification
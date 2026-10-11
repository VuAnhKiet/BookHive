import { FormEvent, useEffect, useState } from 'react';
import Notification from './Notification';
import Payment from './Payment';
import {
  useGetUserProfileQuery,
  useUpdateProfileMutation,
} from '../../services/profileService';
import { getApiErrorMessage } from '../../utils/apiError';

type ProfileTab = 'account' | 'notifications' | 'payments';

function Profile() {
  const {
    data: profile,
    isLoading,
    error,
  } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [activeTab, setActiveTab] = useState<ProfileTab>('account');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName);
    setEmail(profile.email);
    setPhoneNumber(profile.phone_number ?? '');
  }, [profile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setMessage('');
    try {
      await updateProfile({
        fullName,
        email,
        phone_number: phoneNumber,
      }).unwrap();
      setMessage('Profile updated.');
    } catch (requestError: unknown) {
      setFormError(getApiErrorMessage(requestError, 'Could not update your profile.'));
    }
  }

  if (isLoading) return <p role="status">Loading your profile…</p>;
  if (error) {
    return <p role="alert">{getApiErrorMessage(error, 'Could not load your profile.')}</p>;
  }
  if (!profile) {
    return <p role="alert">Sign in again to load your profile.</p>;
  }

  const initials = profile.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <section id="profile-page">
      <h2 className="section-title">Profile &amp; Settings</h2>
      <div className="profile-header">
        <div className="profile-picture">
          {profile.profile_image
            ? <img src={profile.profile_image} alt="" />
            : <span>{initials}</span>}
        </div>
        <div className="profile-info">
          <h2>{profile.fullName}</h2>
          <div className="profile-email">{profile.email}</div>
          <div>{profile.role.replaceAll('_', ' ')}</div>
        </div>
      </div>
      <div className="tabs" role="tablist" aria-label="Profile sections">
        <button
          className={`tab ${activeTab === 'account' ? 'active' : ''}`}
          type="button"
          role="tab"
          aria-selected={activeTab === 'account'}
          onClick={() => setActiveTab('account')}
        >
          Account Settings
        </button>
        <button
          className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
          type="button"
          role="tab"
          aria-selected={activeTab === 'notifications'}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          type="button"
          role="tab"
          aria-selected={activeTab === 'payments'}
          onClick={() => setActiveTab('payments')}
        >
          Payment History
        </button>
      </div>
      {activeTab === 'account' && (
        <div className="tab-content active">
          <form className="form-container" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullname">Full Name</label>
              <input
                id="fullname"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
              />
            </div>
            {formError && <p className="book-detail-error" role="alert">{formError}</p>}
            {message && <p role="status">{message}</p>}
            <div className="form-actions">
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setFullName(profile.fullName);
                  setEmail(profile.email);
                  setPhoneNumber(profile.phone_number ?? '');
                  setFormError('');
                  setMessage('');
                }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
      {activeTab === 'notifications' && <Notification />}
      {activeTab === 'payments' && <Payment />}
    </section>
  );
}

export default Profile;

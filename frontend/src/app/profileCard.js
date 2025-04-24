// src/app/profileCard.js

export default function ProfileCard() {
    return (
      <div className="profile-card">
        <img src="/images/profile.jpg" alt="Profile" />
        <div className="profile-info">
          <h3>Jane Doe</h3>
          <p>28, San Francisco</p>
          <p>Looking for new adventures</p>
        </div>
        <div className="profile-actions">
          <button>&#10060;</button>  {/* Pass button */}
          <button>&#128077;</button>  {/* Like button */}
          <button>&#9993;</button>  {/* Message button */}
        </div>
      </div>
    );
  }
  
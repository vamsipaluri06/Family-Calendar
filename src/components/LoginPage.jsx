import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';

function LoginPage() {
  const { login, adminLogin, verifyUserPassword, users } = useAuth();
  const { FAMILY_MEMBERS } = useFamily();
  const [selectedMember, setSelectedMember] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Get members that have passwords set
  const membersWithAccess = FAMILY_MEMBERS.filter(member => users[member.id]);

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setPassword('');
    setError('');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (verifyUserPassword(selectedMember.id, password)) {
      login(selectedMember);
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    
    if (adminLogin(adminUsername, adminPassword)) {
      // Success - redirect happens automatically
    } else {
      setError('Invalid admin credentials.');
      setAdminPassword('');
    }
  };

  const handleBack = () => {
    setSelectedMember(null);
    setPassword('');
    setError('');
    setShowAdminLogin(false);
    setAdminUsername('');
    setAdminPassword('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <span className="login-icon">📅</span>
          <h1>Family Calendar</h1>
          <p className="login-subtitle">
            {showAdminLogin ? 'Admin Login' : 'Select your profile to continue'}
          </p>
        </div>

        {showAdminLogin ? (
          // Admin login screen
          <div className="admin-login">
            <button className="back-btn" onClick={handleBack}>
              ← Back
            </button>
            
            <div className="admin-avatar">
              🔐
            </div>
            <h2 className="welcome-name">Admin Login</h2>

            <form onSubmit={handleAdminSubmit} className="admin-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => {
                    setAdminUsername(e.target.value);
                    setError('');
                  }}
                  className="admin-input"
                  placeholder="Enter username"
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setError('');
                  }}
                  className="admin-input"
                  placeholder="Enter password"
                />
              </div>
              
              {error && <p className="pin-error">{error}</p>}
              
              <button 
                type="submit" 
                className="login-btn"
                disabled={!adminUsername || !adminPassword}
              >
                Sign In as Admin
              </button>
            </form>
          </div>
        ) : !selectedMember ? (
          // Member selection screen
          <div className="member-selection">
            {membersWithAccess.length > 0 ? (
              <div className="member-grid">
                {membersWithAccess.map(member => (
                  <button
                    key={member.id}
                    className="member-card"
                    onClick={() => handleMemberSelect(member)}
                  >
                    <div 
                      className="member-avatar-large"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <span className="member-name-card">{member.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="no-users-message">
                <p>No users have been set up yet.</p>
                <p>Please contact an admin to create user accounts.</p>
              </div>
            )}
          </div>
        ) : (
          // Password entry screen
          <div className="pin-entry">
            <button className="back-btn" onClick={handleBack}>
              ← Back
            </button>
            
            <div 
              className="selected-member-avatar"
              style={{ backgroundColor: selectedMember.color }}
            >
              {selectedMember.name.charAt(0)}
            </div>
            <h2 className="welcome-name">Hi, {selectedMember.name}!</h2>
            <p className="pin-prompt">Enter your password</p>

            <form onSubmit={handlePasswordSubmit} className="pin-form">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="password-input"
                placeholder="Enter password"
                autoFocus
              />
              
              {error && <p className="pin-error">{error}</p>}
              
              <button 
                type="submit" 
                className="login-btn"
                disabled={!password}
              >
                Sign In
              </button>
            </form>
          </div>
        )}

        <div className="login-footer">
          <p>🔒 Your family's private calendar</p>
        </div>
        
        {!showAdminLogin && !selectedMember && (
          <button 
            className="admin-link-btn"
            onClick={() => setShowAdminLogin(true)}
          >
            🔐 Admin Login
          </button>
        )}
      </div>
    </div>
  );
}

export default LoginPage;

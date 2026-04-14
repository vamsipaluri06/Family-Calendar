import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';
import { APP_VERSION, CHANGELOG } from '../version';

function LoginPage() {
  const { login, adminLogin, verifyUserPassword, users } = useAuth();
  const { FAMILY_MEMBERS } = useFamily();
  const [selectedMember, setSelectedMember] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showChangelog, setShowChangelog] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  
  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);

  // Check if app is already installed
  useEffect(() => {
    // Check if running as standalone (installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    
    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Get members that have passwords set
  const membersWithAccess = FAMILY_MEMBERS.filter(member => users[member.id]);

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setPassword('');
    setError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = await verifyUserPassword(selectedMember.id, password);
    if (isValid) {
      login(selectedMember);
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    
    const success = await adminLogin(adminUsername, adminPassword);
    if (success) {
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
          <div className="footer-buttons">
            {!isInstalled && (
              isInstallable ? (
                <button 
                  className="install-btn"
                  onClick={handleInstallClick}
                >
                  📲 Install App
                </button>
              ) : (
                <button 
                  className="install-btn"
                  onClick={() => setShowInstallInstructions(true)}
                >
                  📲 Install App
                </button>
              )
            )}
            <button 
              className="version-btn"
              onClick={() => setShowChangelog(!showChangelog)}
            >
              v{APP_VERSION}
            </button>
          </div>
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

      {/* Install Instructions Modal */}
      {showInstallInstructions && (
        <div className="changelog-overlay" onClick={() => setShowInstallInstructions(false)}>
          <div className="changelog-modal" onClick={e => e.stopPropagation()}>
            <div className="changelog-header">
              <h2>📲 Install App</h2>
              <button className="modal-close" onClick={() => setShowInstallInstructions(false)}>×</button>
            </div>
            <div className="changelog-content install-instructions">
              {isIOS ? (
                <div className="install-steps">
                  <h3>📱 Install on iPhone/iPad</h3>
                  <ol>
                    <li>Tap the <strong>Share</strong> button <span className="icon-hint">⬆️</span> at the bottom of Safari</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                    <li>Tap <strong>"Add"</strong> in the top right</li>
                  </ol>
                  <p className="install-note">The app will appear on your home screen like a regular app!</p>
                </div>
              ) : isAndroid ? (
                <div className="install-steps">
                  <h3>📱 Install on Android</h3>
                  <ol>
                    <li>Tap the <strong>menu</strong> button <span className="icon-hint">⋮</span> in Chrome</li>
                    <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
                    <li>Tap <strong>"Install"</strong> to confirm</li>
                  </ol>
                  <p className="install-note">The app will appear on your home screen!</p>
                </div>
              ) : (
                <div className="install-steps">
                  <h3>💻 Install on Desktop</h3>
                  <ol>
                    <li>Look for the <strong>install icon</strong> <span className="icon-hint">⊕</span> in your browser's address bar</li>
                    <li>Click it and select <strong>"Install"</strong></li>
                  </ol>
                  <p className="install-note">Or use your browser's menu → "Install Family Calendar"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Changelog Modal */}
      {showChangelog && (
        <div className="changelog-overlay" onClick={() => setShowChangelog(false)}>
          <div className="changelog-modal" onClick={e => e.stopPropagation()}>
            <div className="changelog-header">
              <h2>📋 What's New</h2>
              <button className="modal-close" onClick={() => setShowChangelog(false)}>×</button>
            </div>
            <div className="changelog-content">
              {CHANGELOG.map((release, idx) => (
                <div key={release.version} className={`changelog-release ${idx === 0 ? 'latest' : ''}`}>
                  <div className="release-header">
                    <span className="release-version">v{release.version}</span>
                    <span className="release-date">{release.date}</span>
                    {idx === 0 && <span className="release-badge">Latest</span>}
                  </div>
                  <ul className="release-changes">
                    {release.changes.map((change, i) => (
                      <li key={i}>{change}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;

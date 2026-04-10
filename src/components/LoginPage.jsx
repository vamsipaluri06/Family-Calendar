import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';

function LoginPage() {
  const { login } = useAuth();
  const { FAMILY_MEMBERS } = useFamily();
  const [selectedMember, setSelectedMember] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // Simple PINs for each member (in real app, these would be stored securely)
  const memberPins = {
    'member1': '6565',
    'member2': '6565',
    'member3': '6565'
  };

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setPin('');
    setError('');
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    
    if (pin === memberPins[selectedMember.id]) {
      login(selectedMember);
    } else {
      setError('Incorrect PIN. Try again.');
      setPin('');
    }
  };

  const handleBack = () => {
    setSelectedMember(null);
    setPin('');
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <span className="login-icon">📅</span>
          <h1>Family Calendar</h1>
          <p className="login-subtitle">Select your profile to continue</p>
        </div>

        {!selectedMember ? (
          // Member selection screen
          <div className="member-selection">
            <div className="member-grid">
              {FAMILY_MEMBERS.map(member => (
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
          </div>
        ) : (
          // PIN entry screen
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
            <p className="pin-prompt">Enter your 4-digit PIN</p>

            <form onSubmit={handlePinSubmit} className="pin-form">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPin(val);
                  setError('');
                }}
                className="pin-input"
                placeholder="• • • •"
                autoFocus
              />
              
              {error && <p className="pin-error">{error}</p>}
              
              <button 
                type="submit" 
                className="login-btn"
                disabled={pin.length !== 4}
              >
                Sign In
              </button>
            </form>
          </div>
        )}

        <div className="login-footer">
          <p>🔒 Your family's private calendar</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

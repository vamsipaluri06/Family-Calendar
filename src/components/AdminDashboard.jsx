import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';

function AdminDashboard() {
  const { 
    logout, 
    users, 
    setUserPassword, 
    removeUser, 
    adminCredentials,
    updateAdminCredentials 
  } = useAuth();
  const { FAMILY_MEMBERS, updateFamilyMember, addFamilyMember, removeFamilyMember } = useFamily();
  
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: '', color: '#4285f4', password: '' });
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [adminForm, setAdminForm] = useState({ 
    username: adminCredentials.username, 
    password: '', 
    confirmPassword: '' 
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const colorOptions = [
    '#4285f4', '#ea4335', '#34a853', '#fbbc04', 
    '#9c27b0', '#ff5722', '#00bcd4', '#e91e63'
  ];

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSetPassword = async (memberId) => {
    const member = FAMILY_MEMBERS.find(m => m.id === memberId);
    if (!memberForm.password) {
      showMessage('error', 'Please enter a password');
      return;
    }
    
    try {
      await setUserPassword(memberId, memberForm.password, member.name);
      showMessage('success', `Password set for ${member.name}`);
      setEditingMember(null);
      setMemberForm({ name: '', color: '#4285f4', password: '' });
    } catch (error) {
      showMessage('error', 'Failed to set password');
    }
  };

  const handleRemoveAccess = async (memberId) => {
    const member = FAMILY_MEMBERS.find(m => m.id === memberId);
    if (window.confirm(`Remove login access for ${member.name}?`)) {
      try {
        await removeUser(memberId);
        showMessage('success', `Access removed for ${member.name}`);
      } catch (error) {
        showMessage('error', 'Failed to remove access');
      }
    }
  };

  const handleAddMember = async () => {
    if (!memberForm.name.trim()) {
      showMessage('error', 'Please enter a name');
      return;
    }
    
    try {
      const newMemberId = await addFamilyMember(memberForm.name, memberForm.color);
      if (memberForm.password) {
        await setUserPassword(newMemberId, memberForm.password, memberForm.name);
      }
      showMessage('success', `Added ${memberForm.name}`);
      setShowAddMember(false);
      setMemberForm({ name: '', color: '#4285f4', password: '' });
    } catch (error) {
      showMessage('error', 'Failed to add member');
    }
  };

  const handleUpdateMember = async (memberId) => {
    try {
      await updateFamilyMember(memberId, { 
        name: memberForm.name, 
        color: memberForm.color 
      });
      if (memberForm.password) {
        await setUserPassword(memberId, memberForm.password, memberForm.name);
      }
      showMessage('success', 'Member updated');
      setEditingMember(null);
      setMemberForm({ name: '', color: '#4285f4', password: '' });
    } catch (error) {
      showMessage('error', 'Failed to update member');
    }
  };

  const handleDeleteMember = async (memberId) => {
    const member = FAMILY_MEMBERS.find(m => m.id === memberId);
    if (window.confirm(`Delete ${member.name}? This will also remove their login access.`)) {
      try {
        await removeUser(memberId);
        await removeFamilyMember(memberId);
        showMessage('success', `Deleted ${member.name}`);
      } catch (error) {
        showMessage('error', 'Failed to delete member');
      }
    }
  };

  const handleUpdateAdmin = async () => {
    if (!adminForm.username.trim()) {
      showMessage('error', 'Username is required');
      return;
    }
    if (adminForm.password && adminForm.password !== adminForm.confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }
    
    try {
      const newPassword = adminForm.password || adminCredentials.password;
      await updateAdminCredentials(adminForm.username, newPassword);
      showMessage('success', 'Admin credentials updated');
      setShowAdminSettings(false);
      setAdminForm({ username: adminForm.username, password: '', confirmPassword: '' });
    } catch (error) {
      showMessage('error', 'Failed to update admin credentials');
    }
  };

  const startEditMember = (member) => {
    setEditingMember(member.id);
    setMemberForm({ 
      name: member.name, 
      color: member.color, 
      password: users[member.id]?.password || '' 
    });
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-left">
          <span className="admin-icon">🔐</span>
          <h1>Admin Dashboard</h1>
        </div>
        <button className="logout-btn admin-logout" onClick={logout}>
          Logout
        </button>
      </header>

      {message.text && (
        <div className={`admin-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="admin-content">
        {/* User Management Section */}
        <section className="admin-section">
          <div className="section-header">
            <h2>👥 Family Members</h2>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setShowAddMember(true);
                setMemberForm({ name: '', color: '#4285f4', password: '' });
              }}
            >
              + Add Member
            </button>
          </div>

          {/* Add New Member Form */}
          {showAddMember && (
            <div className="member-form-card">
              <h3>Add New Family Member</h3>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      className={`color-option ${memberForm.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setMemberForm({ ...memberForm, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Password (for login)</label>
                <input
                  type="text"
                  value={memberForm.password}
                  onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
                  placeholder="Set login password"
                />
              </div>
              <div className="form-actions">
                <button className="btn btn-secondary" onClick={() => setShowAddMember(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleAddMember}>
                  Add Member
                </button>
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="members-list">
            {FAMILY_MEMBERS.map(member => (
              <div key={member.id} className="member-card-admin">
                {editingMember === member.id ? (
                  // Edit mode
                  <div className="member-edit-form">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={memberForm.name}
                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Color</label>
                      <div className="color-picker">
                        {colorOptions.map(color => (
                          <button
                            key={color}
                            className={`color-option ${memberForm.color === color ? 'selected' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setMemberForm({ ...memberForm, color })}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="text"
                        value={memberForm.password}
                        onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="form-actions">
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setEditingMember(null);
                          setMemberForm({ name: '', color: '#4285f4', password: '' });
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleUpdateMember(member.id)}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="member-info">
                      <div 
                        className="member-avatar-admin"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div className="member-details">
                        <span className="member-name">{member.name}</span>
                        <span className={`access-status ${users[member.id] ? 'has-access' : 'no-access'}`}>
                          {users[member.id] ? '✓ Has login access' : '✗ No login access'}
                        </span>
                        {users[member.id] && (
                          <span className="password-display">
                            Password: {users[member.id].password}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="member-actions">
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => startEditMember(member)}
                      >
                        Edit
                      </button>
                      {users[member.id] ? (
                        <button 
                          className="btn btn-sm btn-warning"
                          onClick={() => handleRemoveAccess(member.id)}
                        >
                          Remove Access
                        </button>
                      ) : (
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            setEditingMember(member.id);
                            setMemberForm({ name: member.name, color: member.color, password: '' });
                          }}
                        >
                          Set Password
                        </button>
                      )}
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteMember(member.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Admin Settings Section */}
        <section className="admin-section">
          <div className="section-header">
            <h2>⚙️ Admin Settings</h2>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setShowAdminSettings(!showAdminSettings);
                setAdminForm({ 
                  username: adminCredentials.username, 
                  password: '', 
                  confirmPassword: '' 
                });
              }}
            >
              {showAdminSettings ? 'Cancel' : 'Change Credentials'}
            </button>
          </div>

          {showAdminSettings && (
            <div className="admin-settings-form">
              <div className="form-group">
                <label>Admin Username</label>
                <input
                  type="text"
                  value={adminForm.username}
                  onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div className="form-group">
                <label>New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={adminForm.confirmPassword}
                  onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                />
              </div>
              <button className="btn btn-primary" onClick={handleUpdateAdmin}>
                Update Admin Credentials
              </button>
            </div>
          )}

          <div className="current-admin-info">
            <p><strong>Current Username:</strong> {adminCredentials.username}</p>
            <p><strong>Current Password:</strong> {adminCredentials.password}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';

function SettingsModal({ onClose }) {
  const { FAMILY_MEMBERS, updateAllFamilyMembers } = useFamily();
  
  const [members, setMembers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Create a copy of family members for editing
    setMembers(FAMILY_MEMBERS.map(m => ({ ...m })));
  }, [FAMILY_MEMBERS]);

  const handleNameChange = (id, newName) => {
    setMembers(prev => 
      prev.map(m => m.id === id ? { ...m, name: newName } : m)
    );
  };

  const handleColorChange = (id, newColor) => {
    setMembers(prev => 
      prev.map(m => m.id === id ? { ...m, color: newColor } : m)
    );
  };

  const handleSave = async () => {
    // Validate that all names are filled
    if (members.some(m => !m.name.trim())) {
      alert('Please enter a name for all family members');
      return;
    }

    setSaving(true);
    try {
      await updateAllFamilyMembers(members);
      onClose();
    } catch (error) {
      console.error('Error saving family members:', error);
      alert('Failed to save. Please try again.');
    }
    setSaving(false);
  };

  const colorOptions = [
    { color: '#4285f4', name: 'Blue' },
    { color: '#ea4335', name: 'Red' },
    { color: '#34a853', name: 'Green' },
    { color: '#fbbc04', name: 'Yellow' },
    { color: '#9c27b0', name: 'Purple' },
    { color: '#ff6d00', name: 'Orange' },
    { color: '#00bcd4', name: 'Cyan' },
    { color: '#e91e63', name: 'Pink' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-form">
          <div className="settings-section">
            <h3>👨‍👩‍👧 Family Members</h3>
            <p className="settings-hint">Click on a name to edit it</p>
            
            <div className="family-members-editor">
              {members.map((member, index) => (
                <div key={member.id} className="member-edit-row">
                  <span className="member-number">{index + 1}</span>
                  
                  <div 
                    className="member-color-picker"
                    style={{ backgroundColor: member.color }}
                  >
                    <select
                      value={member.color}
                      onChange={(e) => handleColorChange(member.id, e.target.value)}
                      className="color-select"
                    >
                      {colorOptions.map(opt => (
                        <option key={opt.color} value={opt.color}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => handleNameChange(member.id, e.target.value)}
                    placeholder={`Family Member ${index + 1}`}
                    className="member-name-input"
                    maxLength={20}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;

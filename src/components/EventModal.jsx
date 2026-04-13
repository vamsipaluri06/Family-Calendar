import React, { useState, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import TimePicker from './TimePicker';

function EventModal({ event, selectedDate, onClose }) {
  const { addEvent, updateEvent, deleteEvent, FAMILY_MEMBERS } = useFamily();
  
  // Calculate default recurring end date (3 months from now)
  const getDefaultRecurringEndDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().split('T')[0];
  };

  // Get current time rounded to nearest 5 minutes
  const getCurrentTime = () => {
    const now = new Date();
    const minutes = Math.ceil(now.getMinutes() / 5) * 5;
    now.setMinutes(minutes);
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes() % 60).padStart(2, '0');
    return `${hours}:${mins}`;
  };

  // Get time 30 minutes from a given time string
  const getEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes + 30, 0, 0);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const defaultStartTime = getCurrentTime();
  const defaultEndTime = getEndTime(defaultStartTime);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: selectedDate,
    startTime: defaultStartTime,
    end: selectedDate,
    endTime: defaultEndTime,
    allDay: false,
    memberIds: [FAMILY_MEMBERS[0].id], // Array for multiple family members
    recurring: 'none', // 'none', 'daily', 'weekly', 'monthly', 'annually'
    recurringEndDate: getDefaultRecurringEndDate(), // End date for recurring events
    reminder: '30' // minutes before
  });

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (event) {
      const startDate = event.start.split('T')[0];
      const startTime = event.start.includes('T') 
        ? event.start.split('T')[1].substring(0, 5) 
        : '09:00';
      const endDate = event.end ? event.end.split('T')[0] : startDate;
      const endTime = event.end && event.end.includes('T')
        ? event.end.split('T')[1].substring(0, 5)
        : '10:00';

      // Support both old single memberId and new memberIds array
      let memberIds = event.memberIds || [];
      if (memberIds.length === 0 && event.memberId) {
        memberIds = [event.memberId];
      }
      if (memberIds.length === 0) {
        memberIds = [FAMILY_MEMBERS[0].id];
      }

      setFormData({
        title: event.title || '',
        description: event.description || '',
        start: startDate,
        startTime: startTime,
        end: endDate,
        endTime: endTime,
        allDay: event.allDay || false,
        memberIds: memberIds,
        recurring: event.recurring || 'none',
        recurringEndDate: event.recurringEndDate || getDefaultRecurringEndDate(),
        reminder: event.reminder || '30'
      });
    }
  }, [event, FAMILY_MEMBERS]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.memberIds.length === 0) {
      alert('Please select at least one family member');
      return;
    }
    
    const eventData = {
      title: formData.title,
      description: formData.description,
      start: formData.allDay 
        ? formData.start 
        : `${formData.start}T${formData.startTime}`,
      end: formData.allDay 
        ? formData.end 
        : `${formData.end}T${formData.endTime}`,
      allDay: formData.allDay,
      memberIds: formData.memberIds, // Array of selected members
      memberId: formData.memberIds[0], // Keep first one for backward compatibility
      recurring: formData.recurring,
      recurringEndDate: formData.recurring !== 'none' ? formData.recurringEndDate : null,
      reminder: formData.reminder
    };

    try {
      if (event) {
        await updateEvent(event.id, eventData);
      } else {
        await addEvent(eventData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  const handleDelete = async () => {
    let deleteAllRecurring = false;
    
    // If this is a recurring event, ask if user wants to delete all occurrences
    if (event.recurringGroupId) {
      const choice = window.confirm(
        'This is a recurring event.\n\n' +
        'Click OK to delete ALL occurrences of this event.\n' +
        'Click Cancel to delete only this single occurrence.'
      );
      deleteAllRecurring = choice;
    } else if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteEvent(event.id, deleteAllRecurring);
      onClose();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
    setIsDeleting(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If start time changes, auto-set end time to 30 minutes later
    if (name === 'startTime') {
      const [hours, minutes] = value.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      startDate.setMinutes(startDate.getMinutes() + 30);
      
      const endHours = String(startDate.getHours()).padStart(2, '0');
      const endMinutes = String(startDate.getMinutes()).padStart(2, '0');
      const newEndTime = `${endHours}:${endMinutes}`;
      
      setFormData(prev => ({
        ...prev,
        startTime: value,
        endTime: newEndTime
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMemberToggle = (memberId) => {
    setFormData(prev => {
      const currentIds = prev.memberIds;
      if (currentIds.includes(memberId)) {
        // Remove if already selected (but keep at least one)
        if (currentIds.length > 1) {
          return { ...prev, memberIds: currentIds.filter(id => id !== memberId) };
        }
        return prev; // Don't remove the last one
      } else {
        // Add if not selected
        return { ...prev, memberIds: [...currentIds, memberId] };
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'New Event'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Add title"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Family Members</label>
            <div className="member-picker">
              {FAMILY_MEMBERS.map(member => (
                <label 
                  key={member.id} 
                  className={`member-chip ${formData.memberIds.includes(member.id) ? 'selected' : ''}`}
                  style={{ 
                    '--member-color': member.color,
                    borderColor: formData.memberIds.includes(member.id) ? member.color : 'transparent'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.memberIds.includes(member.id)}
                    onChange={() => handleMemberToggle(member.id)}
                  />
                  <span 
                    className="member-dot"
                    style={{ backgroundColor: member.color }}
                  ></span>
                  <span className="member-name">{member.name}</span>
                </label>
              ))}
            </div>
            <p className="form-hint">Select one or more family members</p>
          </div>

          <div className="form-row">
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                name="allDay"
                checked={formData.allDay}
                onChange={handleChange}
              />
              <span>All day</span>
            </label>
          </div>

          <div className="form-row date-time-row">
            <div className="form-group">
              <label htmlFor="start">Start Date</label>
              <input
                type="date"
                id="start"
                name="start"
                value={formData.start}
                onChange={handleChange}
                required
              />
            </div>
            {!formData.allDay && (
              <div className="form-group">
                <label>Start Time</label>
                <TimePicker
                  value={formData.startTime}
                  onChange={handleChange}
                  label="Start Time"
                />
              </div>
            )}
          </div>

          <div className="form-row date-time-row">
            <div className="form-group">
              <label htmlFor="end">End Date</label>
              <input
                type="date"
                id="end"
                name="end"
                value={formData.end}
                onChange={handleChange}
                required
              />
            </div>
            {!formData.allDay && (
              <div className="form-group">
                <label>End Time</label>
                <TimePicker
                  value={formData.endTime}
                  onChange={handleChange}
                  label="End Time"
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="recurring">Repeat</label>
            <select
              id="recurring"
              name="recurring"
              value={formData.recurring}
              onChange={handleChange}
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="annually">Annually</option>
            </select>
          </div>

          {formData.recurring !== 'none' && (
            <div className="form-group">
              <label htmlFor="recurringEndDate">Repeat Until</label>
              <input
                type="date"
                id="recurringEndDate"
                name="recurringEndDate"
                value={formData.recurringEndDate}
                onChange={handleChange}
                min={formData.start}
                required
              />
              <p className="form-hint">Events will be created until this date</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="reminder">Reminder</label>
            <select
              id="reminder"
              name="reminder"
              value={formData.reminder}
              onChange={handleChange}
            >
              <option value="0">At time of event</option>
              <option value="5">5 minutes before</option>
              <option value="15">15 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
              <option value="1440">1 day before</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add description..."
              rows={3}
            />
          </div>

          <div className="modal-actions">
            {event && (
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
            <div className="action-right">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {event ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventModal;

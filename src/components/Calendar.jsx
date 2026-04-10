import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useFamily } from '../context/FamilyContext';

// Helper to format date as YYYY-MM-DD in local time
const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Meal colors - pleasant rainbow palette
const MEAL_COLORS = {
  breakfast: '#FF9AA2', // Soft coral/pink
  lunch: '#FFB347',     // Soft orange
  snack: '#B5EAD7',     // Soft mint green
  dinner: '#C7CEEA',    // Soft lavender
};

function Calendar({ selectedDate, onDateSelect, onEventClick, onAddEvent }) {
  const calendarRef = useRef(null);
  const { events, FAMILY_MEMBERS, MEAL_TYPES, getMeal, setMeal } = useFamily();
  const [mealPopupDate, setMealPopupDate] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [votingMeal, setVotingMeal] = useState(null); // { mealType, voteType: 'like' | 'dislike' }

  // Handle member vote
  const handleMemberVote = async (memberId) => {
    if (!votingMeal || !mealPopupDate) return;
    
    const meal = getMeal(mealPopupDate, votingMeal.mealType);
    if (!meal) return;

    const likedBy = meal.likedBy || [];
    const dislikedBy = meal.dislikedBy || [];
    
    // Check if member already voted
    if (likedBy.includes(memberId) || dislikedBy.includes(memberId)) {
      return;
    }

    if (votingMeal.voteType === 'like') {
      await setMeal(mealPopupDate, votingMeal.mealType, { 
        ...meal, 
        likedBy: [...likedBy, memberId],
        likes: (meal.likes || 0) + 1
      });
    } else {
      await setMeal(mealPopupDate, votingMeal.mealType, { 
        ...meal, 
        dislikedBy: [...dislikedBy, memberId],
        dislikes: (meal.dislikes || 0) + 1
      });
    }
    setVotingMeal(null);
  };

  // Get members who haven't voted yet
  const getUnvotedMembers = (meal) => {
    const likedBy = meal?.likedBy || [];
    const dislikedBy = meal?.dislikedBy || [];
    return FAMILY_MEMBERS.filter(m => !likedBy.includes(m.id) && !dislikedBy.includes(m.id));
  };

  // Navigate to selected date when it changes
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(selectedDate);
    }
  }, [selectedDate]);

  // Check if a date has any meals
  const dateHasMeals = (dateStr) => {
    return MEAL_TYPES.some(mealType => getMeal(dateStr, mealType.id));
  };

  // Get meals for a specific date
  const getMealsForDate = (dateStr) => {
    return MEAL_TYPES.map(mealType => ({
      ...mealType,
      meal: getMeal(dateStr, mealType.id)
    })).filter(item => item.meal);
  };

  // Transform events for FullCalendar (only regular events, not meals)
  const calendarEvents = events.map(event => {
    const memberIds = event.memberIds || (event.memberId ? [event.memberId] : []);
    const firstMember = FAMILY_MEMBERS.find(m => memberIds.includes(m.id));
    const memberNames = memberIds
      .map(id => FAMILY_MEMBERS.find(m => m.id === id)?.name)
      .filter(Boolean)
      .join(', ');
    
    return {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      backgroundColor: firstMember?.color || '#4285f4',
      borderColor: firstMember?.color || '#4285f4',
      extendedProps: {
        description: event.description,
        memberIds: memberIds,
        memberNames: memberNames,
        type: 'event'
      }
    };
  });

  const handleDateClick = (info) => {
    onDateSelect(info.dateStr);
  };

  const handleEventClick = (info) => {
    const event = events.find(e => e.id === info.event.id);
    if (event) {
      onEventClick(event);
    }
  };

  const handleSelect = (info) => {
    onDateSelect(info.startStr.split('T')[0]);
  };

  // Handle food bowl icon click
  const handleMealIconClick = (e, dateStr) => {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    setPopupPosition({ 
      x: rect.left + rect.width / 2, 
      y: rect.bottom + 5 
    });
    setMealPopupDate(mealPopupDate === dateStr ? null : dateStr);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.meal-popup') && !e.target.closest('.meal-icon-btn')) {
        setMealPopupDate(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle day cell mounting
  const handleDayCellDidMount = (arg) => {
    // Add rainbow gradient based on day of week
    const dayOfWeek = arg.date.getDay();
    const rainbowColors = [
      'rgba(255, 182, 193, 0.15)', // Sunday - pink
      'rgba(255, 218, 185, 0.15)', // Monday - peach
      'rgba(255, 255, 186, 0.15)', // Tuesday - yellow
      'rgba(186, 255, 201, 0.15)', // Wednesday - green
      'rgba(186, 225, 255, 0.15)', // Thursday - blue
      'rgba(218, 186, 255, 0.15)', // Friday - purple
      'rgba(255, 186, 255, 0.15)', // Saturday - magenta
    ];
    arg.el.style.backgroundColor = rainbowColors[dayOfWeek];
  };

  // Custom day cell content with food bowl icon
  const dayCellContent = (arg) => {
    const dateStr = formatDateLocal(arg.date);
    const hasMeals = dateHasMeals(dateStr);
    
    return (
      <div className="day-cell-content">
        {hasMeals && (
          <button 
            className="meal-icon-btn"
            onClick={(e) => handleMealIconClick(e, dateStr)}
            title="View meals"
          >
            🍲
          </button>
        )}
        <span className="day-number">{arg.dayNumberText}</span>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>Calendar</h2>
        <div className="calendar-actions">
          <button className="btn btn-primary" onClick={onAddEvent}>
            + Add Event
          </button>
        </div>
      </div>
      
      <div className="calendar-wrapper">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          selectable={true}
          select={handleSelect}
          dayCellContent={dayCellContent}
          dayCellDidMount={handleDayCellDidMount}
          eventDisplay="block"
          dayMaxEvents={5}
          weekends={true}
          nowIndicator={true}
          height="auto"
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
        />

        {/* Meal Popup - appears when food bowl icon is clicked */}
        {mealPopupDate && (
          <div 
            className="meal-popup"
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
            }}
          >
            <div className="popup-header">
              <span className="popup-date">
                🍽️ {new Date(mealPopupDate + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              <button className="popup-close" onClick={() => setMealPopupDate(null)}>×</button>
            </div>
            <div className="popup-meals">
              {getMealsForDate(mealPopupDate).map(item => {
                const likedBy = item.meal?.likedBy || [];
                const dislikedBy = item.meal?.dislikedBy || [];
                const allVoted = likedBy.length + dislikedBy.length >= FAMILY_MEMBERS.length;
                const isVotingThis = votingMeal?.mealType === item.id;
                
                return (
                  <div 
                    key={item.id} 
                    className="popup-meal-row"
                    style={{ borderLeftColor: MEAL_COLORS[item.id] }}
                  >
                    <div className="popup-meal-info">
                      <span className="popup-meal-icon">{item.icon}</span>
                      <span className="popup-meal-name">{item.meal?.name}</span>
                    </div>
                    
                    <div className="popup-votes">
                      {/* Like section */}
                      <div className="vote-section">
                        <button 
                          className={`vote-btn like ${allVoted ? 'disabled' : ''} ${isVotingThis && votingMeal.voteType === 'like' ? 'active' : ''}`}
                          onClick={() => !allVoted && setVotingMeal(
                            isVotingThis && votingMeal.voteType === 'like' 
                              ? null 
                              : { mealType: item.id, voteType: 'like' }
                          )}
                          disabled={allVoted}
                          title={allVoted ? 'All voted' : 'Click to vote'}
                        >
                          👍
                        </button>
                        <div className="vote-avatars">
                          {likedBy.map(memberId => {
                            const member = FAMILY_MEMBERS.find(m => m.id === memberId);
                            return member ? (
                              <span 
                                key={memberId}
                                className="mini-avatar"
                                style={{ backgroundColor: member.color }}
                                title={member.name}
                              >
                                {member.name.charAt(0)}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                      
                      {/* Dislike section */}
                      <div className="vote-section">
                        <button 
                          className={`vote-btn dislike ${allVoted ? 'disabled' : ''} ${isVotingThis && votingMeal.voteType === 'dislike' ? 'active' : ''}`}
                          onClick={() => !allVoted && setVotingMeal(
                            isVotingThis && votingMeal.voteType === 'dislike' 
                              ? null 
                              : { mealType: item.id, voteType: 'dislike' }
                          )}
                          disabled={allVoted}
                          title={allVoted ? 'All voted' : 'Click to vote'}
                        >
                          👎
                        </button>
                        <div className="vote-avatars">
                          {dislikedBy.map(memberId => {
                            const member = FAMILY_MEMBERS.find(m => m.id === memberId);
                            return member ? (
                              <span 
                                key={memberId}
                                className="mini-avatar"
                                style={{ backgroundColor: member.color }}
                                title={member.name}
                              >
                                {member.name.charAt(0)}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {/* Member selection dropdown */}
                    {isVotingThis && (
                      <div className="member-vote-picker">
                        <span className="picker-label">Who's voting?</span>
                        <div className="picker-members">
                          {getUnvotedMembers(item.meal).map(member => (
                            <button
                              key={member.id}
                              className="picker-member"
                              style={{ backgroundColor: member.color }}
                              onClick={() => handleMemberVote(member.id)}
                              title={member.name}
                            >
                              {member.name.charAt(0)}
                            </button>
                          ))}
                          {getUnvotedMembers(item.meal).length === 0 && (
                            <span className="no-members">All voted!</span>
                          )}
                        </div>
                        <button className="picker-cancel" onClick={() => setVotingMeal(null)}>Cancel</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Date Summary - Full Details */}
      <div className="date-summary">
        <h3>📆 {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</h3>
        
        <div className="date-events">
          <h4>📋 Events</h4>
          {events
            .filter(e => e.start.startsWith(selectedDate))
            .map(event => {
              // Support both single memberId and multiple memberIds
              const memberIds = event.memberIds || (event.memberId ? [event.memberId] : []);
              const members = memberIds
                .map(id => FAMILY_MEMBERS.find(m => m.id === id))
                .filter(Boolean);
              const firstMember = members[0];
              
              const startTime = event.allDay 
                ? 'All Day' 
                : new Date(event.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
              const endTime = event.end && !event.allDay
                ? new Date(event.end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                : null;
              
              return (
                <div 
                  key={event.id} 
                  className="event-item-full"
                  onClick={() => onEventClick(event)}
                  style={{ borderLeftColor: firstMember?.color || '#4285f4' }}
                >
                  <div className="event-header-row">
                    <div className="event-title-large">{event.title}</div>
                    {event.recurring && event.recurring !== 'none' && (
                      <span className="recurring-badge">🔄 {event.recurring}</span>
                    )}
                  </div>
                  
                  <div className="event-info-grid">
                    <div className="event-info-item">
                      <span className="info-icon">🕐</span>
                      <span className="info-text">
                        {startTime}{endTime ? ` - ${endTime}` : ''}
                      </span>
                    </div>
                    
                    {members.length > 0 && (
                      <div className="event-info-item">
                        <span className="info-icon">👥</span>
                        <div className="info-members">
                          {members.map(m => (
                            <span 
                              key={m.id} 
                              className="member-tag"
                              style={{ backgroundColor: m.color }}
                            >
                              {m.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {event.description && (
                      <div className="event-info-item event-description-full">
                        <span className="info-icon">📝</span>
                        <span className="info-text">{event.description}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="event-click-hint">Click to edit</div>
                </div>
              );
            })}
          {events.filter(e => e.start.startsWith(selectedDate)).length === 0 && (
            <p className="no-events">No events scheduled for this day</p>
          )}
        </div>

        <div className="date-meals">
          <h4>🍽️ Meals</h4>
          {MEAL_TYPES.map(mealType => {
            const meal = getMeal(selectedDate, mealType.id);
            const likedBy = meal?.likedBy || [];
            const dislikedBy = meal?.dislikedBy || [];
            
            return (
              <div key={mealType.id} className="meal-slot-full">
                <div className="meal-slot-header">
                  <span className="meal-icon">{mealType.icon}</span>
                  <span className="meal-type">{mealType.name}</span>
                  <span className="meal-name">{meal?.name || '—'}</span>
                </div>
                
                {meal && (likedBy.length > 0 || dislikedBy.length > 0) && (
                  <div className="meal-slot-votes">
                    {likedBy.length > 0 && (
                      <div className="meal-vote-group">
                        <span className="vote-emoji">👍</span>
                        <div className="vote-avatars-summary">
                          {likedBy.map(memberId => {
                            const member = FAMILY_MEMBERS.find(m => m.id === memberId);
                            return member ? (
                              <span 
                                key={memberId}
                                className="mini-avatar"
                                style={{ backgroundColor: member.color }}
                                title={member.name}
                              >
                                {member.name.charAt(0)}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    {dislikedBy.length > 0 && (
                      <div className="meal-vote-group">
                        <span className="vote-emoji">👎</span>
                        <div className="vote-avatars-summary">
                          {dislikedBy.map(memberId => {
                            const member = FAMILY_MEMBERS.find(m => m.id === memberId);
                            return member ? (
                              <span 
                                key={memberId}
                                className="mini-avatar"
                                style={{ backgroundColor: member.color }}
                                title={member.name}
                              >
                                {member.name.charAt(0)}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Calendar;

import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';

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

// Alternating event colors for better visual distinction
const ALTERNATING_COLORS = [
  { bg: '#667eea', border: '#5a6fd6' },  // Purple
  { bg: '#f093fb', border: '#e080eb' },  // Pink
  { bg: '#4facfe', border: '#3d9bee' },  // Blue
  { bg: '#43e97b', border: '#38d46d' },  // Green
  { bg: '#fa709a', border: '#e8608a' },  // Rose
  { bg: '#fee140', border: '#ecd130' },  // Yellow
];

function Calendar({ selectedDate, onDateSelect, onEventClick, onAddEvent }) {
  const calendarRef = useRef(null);
  const { events, FAMILY_MEMBERS, MEAL_TYPES, getMeal, setMeal, updateEvent } = useFamily();
  const { currentUser } = useAuth();
  const [mealPopupDate, setMealPopupDate] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // Handle vote for logged-in user
  const handleVote = async (mealType, voteType) => {
    if (!mealPopupDate || !currentUser) return;
    
    const meal = getMeal(mealPopupDate, mealType);
    if (!meal) return;

    const likedBy = meal.likedBy || [];
    const dislikedBy = meal.dislikedBy || [];
    const memberId = currentUser.id;
    
    // Check if user already voted
    if (likedBy.includes(memberId) || dislikedBy.includes(memberId)) {
      return;
    }

    if (voteType === 'like') {
      await setMeal(mealPopupDate, mealType, { 
        ...meal, 
        likedBy: [...likedBy, memberId],
        likes: (meal.likes || 0) + 1
      });
    } else {
      await setMeal(mealPopupDate, mealType, { 
        ...meal, 
        dislikedBy: [...dislikedBy, memberId],
        dislikes: (meal.dislikes || 0) + 1
      });
    }
  };

  // Check if current user has voted
  const hasCurrentUserVoted = (meal) => {
    if (!currentUser || !meal) return false;
    const likedBy = meal.likedBy || [];
    const dislikedBy = meal.dislikedBy || [];
    return likedBy.includes(currentUser.id) || dislikedBy.includes(currentUser.id);
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

  // Transform events for FullCalendar with alternating colors for same-day events
  const calendarEvents = (() => {
    // Group events by date
    const eventsByDate = {};
    events.forEach(event => {
      const dateKey = event.start.split('T')[0]; // Get just the date part
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });

    // Transform events with alternating colors
    return events.map(event => {
      const memberIds = event.memberIds || (event.memberId ? [event.memberId] : []);
      const firstMember = FAMILY_MEMBERS.find(m => memberIds.includes(m.id));
      const memberNames = memberIds
        .map(id => FAMILY_MEMBERS.find(m => m.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      
      // Get the index of this event within its day
      const dateKey = event.start.split('T')[0];
      const dayEvents = eventsByDate[dateKey] || [];
      const eventIndex = dayEvents.findIndex(e => e.id === event.id);
      
      // Use alternating colors if there are multiple events on the same day
      let backgroundColor, borderColor;
      if (dayEvents.length > 1) {
        const colorSet = ALTERNATING_COLORS[eventIndex % ALTERNATING_COLORS.length];
        backgroundColor = colorSet.bg;
        borderColor = colorSet.border;
      } else {
        // Single event - use member color or default
        backgroundColor = firstMember?.color || '#4285f4';
        borderColor = firstMember?.color || '#4285f4';
      }
      
      return {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        backgroundColor,
        borderColor,
        classNames: event.completed ? ['event-completed'] : [],
        extendedProps: {
          description: event.description,
          memberIds: memberIds,
          memberNames: memberNames,
          type: 'event',
          completed: event.completed
        }
      };
    });
  })();

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
                const userVoted = hasCurrentUserVoted(item.meal);
                const userLiked = likedBy.includes(currentUser?.id);
                const userDisliked = dislikedBy.includes(currentUser?.id);
                
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
                          className={`vote-btn like ${userVoted ? 'disabled' : ''} ${userLiked ? 'active voted' : ''}`}
                          onClick={() => !userVoted && handleVote(item.id, 'like')}
                          disabled={userVoted}
                          title={userVoted ? (userLiked ? 'You liked this' : 'You already voted') : 'Like this meal'}
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
                          className={`vote-btn dislike ${userVoted ? 'disabled' : ''} ${userDisliked ? 'active voted' : ''}`}
                          onClick={() => !userVoted && handleVote(item.id, 'dislike')}
                          disabled={userVoted}
                          title={userVoted ? (userDisliked ? 'You disliked this' : 'You already voted') : 'Dislike this meal'}
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
            .sort((a, b) => {
              // Sort: incomplete events first, completed events last
              if (a.completed && !b.completed) return 1;
              if (!a.completed && b.completed) return -1;
              return 0;
            })
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
              
              const toggleComplete = async (e) => {
                e.stopPropagation();
                await updateEvent(event.id, { ...event, completed: !event.completed });
              };

              return (
                <div 
                  key={event.id} 
                  className={`event-item-full ${event.completed ? 'event-completed' : ''}`}
                  onClick={() => onEventClick(event)}
                  style={{ borderLeftColor: firstMember?.color || '#4285f4' }}
                >
                  <div className="event-header-row">
                    <button 
                      className={`complete-checkbox ${event.completed ? 'checked' : ''}`}
                      onClick={toggleComplete}
                      title={event.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {event.completed ? '✓' : ''}
                    </button>
                    <div className={`event-title-large ${event.completed ? 'completed-text' : ''}`}>{event.title}</div>
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

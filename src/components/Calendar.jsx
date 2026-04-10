import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useFamily } from '../context/FamilyContext';

// Meal colors - pleasant rainbow palette
const MEAL_COLORS = {
  breakfast: '#FF9AA2', // Soft coral/pink
  lunch: '#FFB347',     // Soft orange
  snack: '#B5EAD7',     // Soft mint green
  dinner: '#C7CEEA',    // Soft lavender
};

function Calendar({ selectedDate, onDateSelect, onEventClick, onAddEvent }) {
  const calendarRef = useRef(null);
  const { events, FAMILY_MEMBERS, MEAL_TYPES, getMeal, meals } = useFamily();
  const [hoveredDate, setHoveredDate] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  // Navigate to selected date when it changes
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(selectedDate);
    }
  }, [selectedDate]);

  // Generate meal events for every day that has meals
  const mealEvents = [];
  Object.keys(meals).forEach(key => {
    const meal = meals[key];
    if (meal && meal.name) {
      const mealType = MEAL_TYPES.find(mt => mt.id === meal.mealType);
      if (mealType) {
        mealEvents.push({
          id: `meal_${key}`,
          title: `${mealType.icon} ${meal.name}`,
          start: `${meal.date}T${mealType.time}`,
          allDay: false,
          backgroundColor: MEAL_COLORS[meal.mealType] || '#FFB347',
          borderColor: MEAL_COLORS[meal.mealType] || '#FFB347',
          textColor: '#333',
          extendedProps: {
            type: 'meal',
            mealType: meal.mealType,
            mealName: meal.name
          }
        });
      }
    }
  });

  // Transform events for FullCalendar
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

  // Combine calendar events and meal events
  const allEvents = [...calendarEvents, ...mealEvents];

  const handleDateClick = (info) => {
    onDateSelect(info.dateStr);
  };

  const handleEventClick = (info) => {
    // Only handle non-meal events
    if (info.event.extendedProps.type !== 'meal') {
      const event = events.find(e => e.id === info.event.id);
      if (event) {
        onEventClick(event);
      }
    }
  };

  const handleSelect = (info) => {
    onDateSelect(info.startStr.split('T')[0]);
    onAddEvent();
  };

  // Handle mouse enter on day cell
  const handleDayCellDidMount = (arg) => {
    const dateStr = arg.date.toISOString().split('T')[0];
    
    arg.el.addEventListener('mouseenter', (e) => {
      const rect = arg.el.getBoundingClientRect();
      setHoverPosition({ 
        x: rect.left + rect.width / 2, 
        y: rect.bottom + 5 
      });
      setHoveredDate(dateStr);
    });
    
    arg.el.addEventListener('mouseleave', () => {
      setHoveredDate(null);
    });

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

  // Get meals for hovered date
  const getHoveredDateMeals = () => {
    if (!hoveredDate) return [];
    return MEAL_TYPES.map(mealType => ({
      ...mealType,
      meal: getMeal(hoveredDate, mealType.id)
    }));
  };

  // Custom day cell content
  const dayCellContent = (arg) => {
    return (
      <div className="day-cell-content">
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
          events={allEvents}
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

        {/* Hover Popup for Day */}
        {hoveredDate && (
          <div 
            className="day-hover-popup"
            style={{
              left: `${hoverPosition.x}px`,
              top: `${hoverPosition.y}px`,
            }}
          >
            <div className="popup-header">
              <span className="popup-date">
                {new Date(hoveredDate + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="popup-meals">
              {getHoveredDateMeals().map(item => (
                <div 
                  key={item.id} 
                  className="popup-meal-row"
                  style={{ borderLeftColor: MEAL_COLORS[item.id] }}
                >
                  <span className="popup-meal-icon">{item.icon}</span>
                  <span className="popup-meal-time">{item.time}</span>
                  <span className="popup-meal-name">
                    {item.meal?.name || '—'}
                  </span>
                </div>
              ))}
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
            return (
              <div key={mealType.id} className="meal-slot">
                <span className="meal-icon">{mealType.icon}</span>
                <span className="meal-type">{mealType.name}</span>
                <span className="meal-name">{meal?.name || '—'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Calendar;

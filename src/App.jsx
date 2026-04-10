import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import MealPlanner from './components/MealPlanner';
import GroceryList from './components/GroceryList';
import EventModal from './components/EventModal';
import MealModal from './components/MealModal';
import SettingsModal from './components/SettingsModal';
import { useFamily } from './context/FamilyContext';
import './App.css';

// Helper to format date as YYYY-MM-DD in local time
const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function App() {
  const [activeView, setActiveView] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(formatDateLocal(new Date()));
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  // Start with sidebar closed on mobile (width <= 768px)
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768);

  // Live clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close sidebar on mobile when window resizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { loading, isFirebaseConnected, FAMILY_MEMBERS } = useFamily();

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const handleAddMeal = (mealType, date) => {
    setEditingMeal({ date: date || selectedDate, mealType, isNew: true });
    setShowMealModal(true);
  };

  const handleEditMeal = (meal, mealType) => {
    setEditingMeal({ ...meal, mealType, isNew: false });
    setShowMealModal(true);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Family Calendar...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button 
            className="menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <span className="grid-icon">
              <span></span><span></span><span></span>
              <span></span><span></span><span></span>
              <span></span><span></span><span></span>
            </span>
          </button>
          <div className="logo">
            <span className="logo-icon">📅</span>
            <span className="logo-text">Family Calendar</span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="live-clock">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit',
              hour12: true 
            })}
          </div>
          <div className="live-date">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
        
        <div className="header-right">
          <div className={`sync-status ${isFirebaseConnected ? 'connected' : 'local'}`}>
            {isFirebaseConnected ? '🔄 Synced' : '💾 Local'}
          </div>
          <div className="family-avatars">
            {FAMILY_MEMBERS.map(member => (
              <div 
                key={member.id}
                className="avatar"
                style={{ backgroundColor: member.color }}
                title={member.name}
              >
                {member.name.charAt(0)}
              </div>
            ))}
          </div>
          <button 
            className="settings-btn"
            onClick={() => setShowSettingsModal(true)}
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      <div className="main-container">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <button className="add-event-btn" onClick={handleAddEvent}>
            <span className="plus-icon">+</span>
            <span>Create</span>
          </button>

          <nav className="nav-menu">
            <button 
              className={`nav-item ${activeView === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveView('calendar')}
            >
              <span className="nav-icon">📅</span>
              <span>Calendar</span>
            </button>
            <button 
              className={`nav-item ${activeView === 'meals' ? 'active' : ''}`}
              onClick={() => setActiveView('meals')}
            >
              <span className="nav-icon">🍽️</span>
              <span>Meal Planner</span>
            </button>
            <button 
              className={`nav-item ${activeView === 'grocery' ? 'active' : ''}`}
              onClick={() => setActiveView('grocery')}
            >
              <span className="nav-icon">🛒</span>
              <span>Grocery List</span>
            </button>
          </nav>

          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <h3>Family Members</h3>
              <button 
                className="edit-link"
                onClick={() => setShowSettingsModal(true)}
                title="Edit family members"
              >
                Edit
              </button>
            </div>
            <div className="family-list">
              {FAMILY_MEMBERS.map(member => (
                <div key={member.id} className="family-item">
                  <span 
                    className="color-dot"
                    style={{ backgroundColor: member.color }}
                  ></span>
                  <span>{member.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Quick Links</h3>
            <button 
              className="quick-link"
              onClick={() => {
                setSelectedDate(formatDateLocal(new Date()));
                setActiveView('calendar');
              }}
            >
              Today
            </button>
            <button 
              className="quick-link"
              onClick={() => {
                setActiveView('meals');
              }}
            >
              This Week's Meals
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {activeView === 'calendar' && (
            <Calendar 
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onEventClick={handleEditEvent}
              onAddEvent={handleAddEvent}
            />
          )}
          {activeView === 'meals' && (
            <MealPlanner 
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onAddMeal={handleAddMeal}
              onEditMeal={handleEditMeal}
            />
          )}
          {activeView === 'grocery' && (
            <GroceryList />
          )}
        </main>
      </div>

      {/* Modals */}
      {showEventModal && (
        <EventModal 
          event={editingEvent}
          selectedDate={selectedDate}
          onClose={() => setShowEventModal(false)}
        />
      )}
      
      {showMealModal && (
        <MealModal 
          meal={editingMeal}
          selectedDate={selectedDate}
          onClose={() => setShowMealModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal 
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}

export default App;

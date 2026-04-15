import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import MealPlanner from './components/MealPlanner';
import GroceryList from './components/GroceryList';
import ExpenseSummary from './components/ExpenseSummary';
import MonthlyUtilities from './components/MonthlyUtilities';
import CreditCards from './components/CreditCards';
import EventModal from './components/EventModal';
import MealModal from './components/MealModal';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import { useFamily } from './context/FamilyContext';
import { useAuth } from './context/AuthContext';
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
  const [mealViewMode, setMealViewMode] = useState('week'); // 'week' or 'today'
  const [selectedDate, setSelectedDate] = useState(formatDateLocal(new Date()));
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  // Start with sidebar closed on mobile (width <= 768px)
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768);
  // Dark theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('familyCalendarDarkMode');
    return saved === 'true';
  });

  // Apply dark mode class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', darkMode);
    localStorage.setItem('familyCalendarDarkMode', darkMode);
  }, [darkMode]);

  // Live clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Auth state
  const { isLoggedIn, currentUser, logout, isAdmin, loading: authLoading } = useAuth();

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

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage />;
  }

  // Show admin dashboard if admin is logged in
  if (isAdmin) {
    return <AdminDashboard />;
  }

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
          <button
            className="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <div className={`sync-status ${isFirebaseConnected ? 'connected' : 'local'}`}>
            {isFirebaseConnected ? '🔄 Synced' : '💾 Local'}
          </div>
          <div className="current-user-info">
            <div 
              className="avatar current-user-avatar"
              style={{ backgroundColor: currentUser?.color }}
              title={`Logged in as ${currentUser?.name}`}
            >
              {currentUser?.name?.charAt(0)}
            </div>
            <span className="current-user-name">{currentUser?.name}</span>
          </div>
          <button 
            className="logout-btn"
            onClick={logout}
            title="Logout"
          >
            🚪
          </button>
        </div>
      </header>

      <div className="main-container">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && window.innerWidth <= 768 && (
          <div 
            className="sidebar-overlay visible" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <button className="add-event-btn" onClick={() => {
            handleAddEvent();
            if (window.innerWidth <= 768) setSidebarOpen(false);
          }}>
            <span className="plus-icon">+</span>
            <span>Create</span>
          </button>

          <nav className="nav-menu">
            <button 
              className={`nav-item ${activeView === 'calendar' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('calendar');
                if (window.innerWidth <= 768) setSidebarOpen(false);
              }}
            >
              <span className="nav-icon">📅</span>
              <span>Calendar</span>
            </button>
            <button 
              className={`nav-item ${activeView === 'meals' ? 'active' : ''}`}
              onClick={() => {
                setMealViewMode('week');
                setActiveView('meals');
                if (window.innerWidth <= 768) setSidebarOpen(false);
              }}
            >
              <span className="nav-icon">🍽️</span>
              <span>Meal Planner</span>
            </button>
            <button 
              className={`nav-item ${activeView === 'grocery' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('grocery');
                if (window.innerWidth <= 768) setSidebarOpen(false);
              }}
            >
              <span className="nav-icon">🛒</span>
              <span>Grocery List</span>
            </button>
            <button 
              className={`nav-item ${activeView === 'expenses' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('expenses');
                if (window.innerWidth <= 768) setSidebarOpen(false);
              }}
            >
              <span className="nav-icon">💰</span>
              <span>Expenses</span>
            </button>
            <button 
              className={`nav-item ${activeView === 'utilities' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('utilities');
                if (window.innerWidth <= 768) setSidebarOpen(false);
              }}
            >
              <span className="nav-icon">🏠</span>
              <span>Utilities</span>
            </button>
            <button 
              className={`nav-item ${activeView === 'creditcards' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('creditcards');
                if (window.innerWidth <= 768) setSidebarOpen(false);
              }}
            >
              <span className="nav-icon">💳</span>
              <span>Credit Cards</span>
            </button>
          </nav>

          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <h3>Family Members</h3>
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
                setMealViewMode('week');
                setActiveView('meals');
              }}
            >
              This Week's Meals
            </button>
            <button 
              className="quick-link"
              onClick={() => {
                setActiveView('expenses');
              }}
            >
              Expenses
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
              viewMode={mealViewMode}
            />
          )}
          {activeView === 'grocery' && (
            <GroceryList />
          )}
          {activeView === 'creditcards' && (
            <CreditCards />
          )}
          {activeView === 'expenses' && (
            <ExpenseSummary />
          )}
          {activeView === 'utilities' && (
            <MonthlyUtilities />
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

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button 
          className={`mobile-nav-btn ${activeView === 'calendar' ? 'active' : ''}`}
          onClick={() => {
            setSidebarOpen(false);
            setActiveView('calendar');
          }}
        >
          <span className="mobile-nav-icon">📅</span>
          <span className="mobile-nav-label">Calendar</span>
        </button>
        <button 
          className={`mobile-nav-btn ${activeView === 'meals' ? 'active' : ''}`}
          onClick={() => {
            setSidebarOpen(false);
            setMealViewMode('today');
            setActiveView('meals');
          }}
        >
          <span className="mobile-nav-icon">🍽️</span>
          <span className="mobile-nav-label">Meals</span>
        </button>
        <button 
          className="mobile-nav-btn add-btn"
          onClick={() => {
            setSidebarOpen(false);
            handleAddEvent();
          }}
        >
          <span className="mobile-nav-icon">➕</span>
          <span className="mobile-nav-label">Add</span>
        </button>
        <button 
          className={`mobile-nav-btn ${activeView === 'grocery' ? 'active' : ''}`}
          onClick={() => {
            setSidebarOpen(false);
            setActiveView('grocery');
          }}
        >
          <span className="mobile-nav-icon">🛒</span>
          <span className="mobile-nav-label">Grocery</span>
        </button>
        <button 
          className={`mobile-nav-btn ${activeView === 'expenses' ? 'active' : ''}`}
          onClick={() => {
            setSidebarOpen(false);
            setActiveView('expenses');
          }}
        >
          <span className="mobile-nav-icon">💰</span>
          <span className="mobile-nav-label">Expenses</span>
        </button>
      </nav>
    </div>
  );
}

export default App;

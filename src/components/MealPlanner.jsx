import React, { useState, useMemo } from 'react';
import { useFamily } from '../context/FamilyContext';

// Helper to format date as YYYY-MM-DD in local time
const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function MealPlanner({ selectedDate, onDateSelect, onAddMeal, onEditMeal, viewMode = 'week' }) {
  const { MEAL_TYPES, getMeal, generateGroceryFromMeals } = useFamily();
  const [generatingGrocery, setGeneratingGrocery] = useState(false);
  
  // Determine view: use prop viewMode directly
  const showTodayOnly = viewMode === 'today';

  // Get week dates based on selected date
  const weekDates = useMemo(() => {
    const dates = [];
    const selected = new Date(selectedDate + 'T12:00:00'); // Use noon to avoid timezone issues
    const dayOfWeek = selected.getDay();
    const startOfWeek = new Date(selected);
    startOfWeek.setDate(selected.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(formatDateLocal(date));
    }
    return dates;
  }, [selectedDate]);

  const handleGenerateGroceryList = async () => {
    setGeneratingGrocery(true);
    try {
      const count = await generateGroceryFromMeals(weekDates[0], weekDates[6]);
      alert(`Added ${count} items to your grocery list!`);
    } catch (error) {
      console.error('Error generating grocery list:', error);
      alert('Failed to generate grocery list. Please try again.');
    }
    setGeneratingGrocery(false);
  };

  const navigateWeek = (direction) => {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() + (direction * 7));
    onDateSelect(formatDateLocal(current));
  };

  const formatDayHeader = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      isToday: dateStr === formatDateLocal(new Date()),
      isSelected: dateStr === selectedDate
    };
  };

  return (
    <div className="meal-planner">
      <div className="meal-planner-header">
        <h2>🍽️ {showTodayOnly ? "Today's Meals" : "Meal Planner"}</h2>
        {!showTodayOnly && (
          <div className="meal-planner-controls">
            <button 
              className="btn btn-secondary"
              onClick={handleGenerateGroceryList}
              disabled={generatingGrocery}
            >
              {generatingGrocery ? '⏳ Generating...' : '🛒 Generate Grocery List'}
            </button>
          </div>
        )}
      </div>

      {/* Week Navigation - hide when showing today only */}
      {!showTodayOnly && (
        <div className="week-navigation">
          <button className="nav-arrow" onClick={() => navigateWeek(-1)}>←</button>
          <span className="week-range">
            {new Date(weekDates[0] + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' - '}
            {new Date(weekDates[6] + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button className="nav-arrow" onClick={() => navigateWeek(1)}>→</button>
          <button className="today-btn" onClick={() => onDateSelect(formatDateLocal(new Date()))}>
            Today
          </button>
        </div>
      )}

      {/* Today View (from mobile nav) */}
      {showTodayOnly ? (
        <div className="meal-grid day-view mobile-today-view">
          <div className="mobile-date-display">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>

          <div className="day-meals">
            {MEAL_TYPES.map(mealType => {
              const today = formatDateLocal(new Date());
              const meal = getMeal(today, mealType.id);
              return (
                <div 
                  key={mealType.id} 
                  className={`day-meal-card ${meal ? 'has-meal' : ''}`}
                  onClick={() => meal 
                    ? onEditMeal(meal, mealType.id)
                    : onAddMeal(mealType.id, today)
                  }
                >
                  <div className="meal-card-header">
                    <span className="meal-icon">{mealType.icon}</span>
                    <span className="meal-type-name">{mealType.name}</span>
                    <span className="meal-time">{mealType.time}</span>
                  </div>
                  
                  {meal ? (
                    <div className="meal-card-content">
                      <h4>{meal.name}</h4>
                      {meal.description && (
                        <p className="meal-description">{meal.description}</p>
                      )}
                    </div>
                  ) : (
                    <div className="meal-card-empty">
                      <span className="add-icon">+</span>
                      <span>Add {mealType.name}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Week View */
        <div className="meal-grid week-view">
          {/* Header Row */}
          <div className="meal-grid-header">
            <div className="meal-type-column"></div>
            {weekDates.map(dateStr => {
              const { day, date, isToday, isSelected } = formatDayHeader(dateStr);
              return (
                <div 
                  key={dateStr} 
                  className={`day-column-header ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => onDateSelect(dateStr)}
                >
                  <span className="day-name">{day}</span>
                  <span className="day-date">{date}</span>
                </div>
              );
            })}
          </div>

          {/* Meal Rows */}
          {MEAL_TYPES.map(mealType => (
            <div key={mealType.id} className="meal-row">
              <div className="meal-type-column">
                <span className="meal-icon">{mealType.icon}</span>
                <span className="meal-name">{mealType.name}</span>
              </div>
              {weekDates.map(dateStr => {
                const meal = getMeal(dateStr, mealType.id);
                return (
                  <div 
                    key={`${dateStr}-${mealType.id}`} 
                    className={`meal-cell ${meal ? 'has-meal' : ''}`}
                    onClick={() => meal 
                      ? onEditMeal(meal, mealType.id)
                      : onAddMeal(mealType.id, dateStr)
                    }
                  >
                    {meal ? (
                      <div className="meal-content">
                        <span className="meal-title">{meal.name}</span>
                        {meal.ingredients && meal.ingredients.length > 0 && (
                          <span className="ingredient-count">
                            {meal.ingredients.length} items
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="add-meal">+</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Meal Ideas Section */}
      <div className="meal-ideas">
        <h3>💡 Quick Meal Ideas</h3>
        <div className="idea-chips">
          {[
            'Pancakes', 'Oatmeal', 'Smoothie Bowl',
            'Grilled Chicken Salad', 'Pasta', 'Tacos',
            'Stir Fry', 'Pizza Night', 'Soup & Sandwich'
          ].map(idea => (
            <span key={idea} className="idea-chip">{idea}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MealPlanner;

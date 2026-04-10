import React, { useState, useMemo } from 'react';
import { useFamily } from '../context/FamilyContext';

function MealPlanner({ selectedDate, onDateSelect, onAddMeal, onEditMeal }) {
  const { MEAL_TYPES, getMeal, generateGroceryFromMeals } = useFamily();
  const [viewMode, setViewMode] = useState('week'); // 'day' or 'week'
  const [generatingGrocery, setGeneratingGrocery] = useState(false);

  // Get week dates based on selected date
  const weekDates = useMemo(() => {
    const dates = [];
    const selected = new Date(selectedDate);
    const dayOfWeek = selected.getDay();
    const startOfWeek = new Date(selected);
    startOfWeek.setDate(selected.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
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
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + (direction * 7));
    onDateSelect(current.toISOString().split('T')[0]);
  };

  const formatDayHeader = (dateStr) => {
    const date = new Date(dateStr);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      isToday: dateStr === new Date().toISOString().split('T')[0],
      isSelected: dateStr === selectedDate
    };
  };

  return (
    <div className="meal-planner">
      <div className="meal-planner-header">
        <h2>🍽️ Meal Planner</h2>
        <div className="meal-planner-controls">
          <div className="view-toggle">
            <button 
              className={viewMode === 'day' ? 'active' : ''}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
            <button 
              className={viewMode === 'week' ? 'active' : ''}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
          </div>
          <button 
            className="btn btn-secondary"
            onClick={handleGenerateGroceryList}
            disabled={generatingGrocery}
          >
            {generatingGrocery ? '⏳ Generating...' : '🛒 Generate Grocery List'}
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="week-navigation">
        <button className="nav-arrow" onClick={() => navigateWeek(-1)}>←</button>
        <span className="week-range">
          {new Date(weekDates[0] + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {' - '}
          {new Date(weekDates[6] + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <button className="nav-arrow" onClick={() => navigateWeek(1)}>→</button>
        <button className="today-btn" onClick={() => onDateSelect(new Date().toISOString().split('T')[0])}>
          Today
        </button>
      </div>

      {viewMode === 'week' ? (
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
      ) : (
        /* Day View */
        <div className="meal-grid day-view">
          <div className="day-view-header">
            <button onClick={() => {
              const prev = new Date(selectedDate);
              prev.setDate(prev.getDate() - 1);
              onDateSelect(prev.toISOString().split('T')[0]);
            }}>←</button>
            <h3>
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <button onClick={() => {
              const next = new Date(selectedDate + 'T12:00:00');
              next.setDate(next.getDate() + 1);
              onDateSelect(next.toISOString().split('T')[0]);
            }}>→</button>
          </div>

          <div className="day-meals">
            {MEAL_TYPES.map(mealType => {
              const meal = getMeal(selectedDate, mealType.id);
              return (
                <div 
                  key={mealType.id} 
                  className={`day-meal-card ${meal ? 'has-meal' : ''}`}
                  onClick={() => meal 
                    ? onEditMeal(meal, mealType.id)
                    : onAddMeal(mealType.id)
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
                      {meal.ingredients && meal.ingredients.length > 0 && (
                        <div className="meal-ingredients">
                          <strong>Ingredients:</strong>
                          <ul>
                            {meal.ingredients.slice(0, 5).map((ing, idx) => (
                              <li key={idx}>{ing}</li>
                            ))}
                            {meal.ingredients.length > 5 && (
                              <li className="more">+{meal.ingredients.length - 5} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                      {meal.recipe && (
                        <div className="meal-recipe-preview">
                          <strong>Recipe:</strong> {meal.recipe.slice(0, 100)}...
                        </div>
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

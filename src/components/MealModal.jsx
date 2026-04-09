import React, { useState, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';

function MealModal({ meal, selectedDate, onClose }) {
  const { setMeal, MEAL_TYPES } = useFamily();
  
  const mealType = MEAL_TYPES.find(mt => mt.id === meal?.mealType);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ingredients: [],
    recipe: '',
    prepTime: '',
    cookTime: '',
    servings: '3',
    notes: ''
  });

  const [ingredientInput, setIngredientInput] = useState('');

  useEffect(() => {
    if (meal && !meal.isNew) {
      setFormData({
        name: meal.name || '',
        description: meal.description || '',
        ingredients: meal.ingredients || [],
        recipe: meal.recipe || '',
        prepTime: meal.prepTime || '',
        cookTime: meal.cookTime || '',
        servings: meal.servings || '3',
        notes: meal.notes || ''
      });
    }
  }, [meal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const mealData = {
      ...formData,
      date: meal.date || selectedDate,
    };

    try {
      await setMeal(meal.date || selectedDate, meal.mealType, mealData);
      onClose();
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Failed to save meal. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredientInput.trim()]
      }));
      setIngredientInput('');
    }
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleIngredientKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  // Common ingredient suggestions
  const commonIngredients = [
    'Salt', 'Pepper', 'Olive Oil', 'Garlic', 'Onion', 
    'Butter', 'Eggs', 'Milk', 'Flour', 'Sugar'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal meal-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="meal-modal-title">
            <span className="meal-icon">{mealType?.icon}</span>
            <h2>{meal?.isNew ? `Add ${mealType?.name}` : `Edit ${mealType?.name}`}</h2>
          </div>
          <div className="meal-date">
            {new Date(meal?.date || selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Meal Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Grilled Chicken Salad"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description..."
            />
          </div>

          <div className="form-row time-row">
            <div className="form-group">
              <label htmlFor="prepTime">Prep Time</label>
              <input
                type="text"
                id="prepTime"
                name="prepTime"
                value={formData.prepTime}
                onChange={handleChange}
                placeholder="15 mins"
              />
            </div>
            <div className="form-group">
              <label htmlFor="cookTime">Cook Time</label>
              <input
                type="text"
                id="cookTime"
                name="cookTime"
                value={formData.cookTime}
                onChange={handleChange}
                placeholder="30 mins"
              />
            </div>
            <div className="form-group">
              <label htmlFor="servings">Servings</label>
              <select
                id="servings"
                name="servings"
                value={formData.servings}
                onChange={handleChange}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group ingredients-group">
            <label>Ingredients</label>
            <div className="ingredient-input-row">
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyPress={handleIngredientKeyPress}
                placeholder="Add ingredient..."
              />
              <button type="button" className="btn btn-secondary" onClick={addIngredient}>
                Add
              </button>
            </div>
            
            {/* Quick add common ingredients */}
            <div className="quick-ingredients">
              {commonIngredients
                .filter(ing => !formData.ingredients.includes(ing))
                .slice(0, 5)
                .map(ing => (
                  <button
                    key={ing}
                    type="button"
                    className="ingredient-chip quick"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      ingredients: [...prev.ingredients, ing]
                    }))}
                  >
                    + {ing}
                  </button>
                ))}
            </div>

            {formData.ingredients.length > 0 && (
              <div className="ingredients-list">
                {formData.ingredients.map((ing, index) => (
                  <span key={index} className="ingredient-chip">
                    {ing}
                    <button 
                      type="button"
                      onClick={() => removeIngredient(index)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            <p className="ingredients-help">
              💡 Add ingredients to auto-generate your grocery list
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="recipe">Recipe / Instructions</label>
            <textarea
              id="recipe"
              name="recipe"
              value={formData.recipe}
              onChange={handleChange}
              placeholder="Step-by-step cooking instructions..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {meal?.isNew ? 'Add Meal' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MealModal;

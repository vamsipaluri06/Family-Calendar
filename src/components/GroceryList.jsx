import React, { useState, useMemo } from 'react';
import { useFamily } from '../context/FamilyContext';

function GroceryList() {
  const { 
    groceryItems, 
    addGroceryItem, 
    toggleGroceryItem, 
    removeGroceryItem,
    clearCheckedGroceryItems 
  } = useFamily();
  
  const [newItem, setNewItem] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'checked'
  const [sortBy, setSortBy] = useState('added'); // 'added', 'name', 'meal'

  // Categorize items
  const categorizedItems = useMemo(() => {
    const categories = {
      'Produce': [],
      'Dairy': [],
      'Meat & Seafood': [],
      'Bakery': [],
      'Pantry': [],
      'Frozen': [],
      'Beverages': [],
      'Other': []
    };

    const produceKeywords = ['apple', 'banana', 'orange', 'lettuce', 'tomato', 'onion', 'garlic', 'pepper', 'carrot', 'broccoli', 'spinach', 'potato', 'avocado', 'lemon', 'lime', 'cucumber', 'celery', 'mushroom', 'fruit', 'vegetable'];
    const dairyKeywords = ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg', 'eggs'];
    const meatKeywords = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'bacon', 'sausage', 'turkey', 'meat'];
    const bakeryKeywords = ['bread', 'bagel', 'muffin', 'croissant', 'roll', 'bun', 'tortilla'];
    const frozenKeywords = ['frozen', 'ice cream', 'pizza'];
    const beverageKeywords = ['juice', 'soda', 'water', 'coffee', 'tea', 'wine', 'beer'];

    let filteredItems = groceryItems;
    if (filter === 'pending') {
      filteredItems = groceryItems.filter(i => !i.checked);
    } else if (filter === 'checked') {
      filteredItems = groceryItems.filter(i => i.checked);
    }

    // Sort items
    filteredItems = [...filteredItems].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'meal') return (a.fromMeal || '').localeCompare(b.fromMeal || '');
      return b.createdAt - a.createdAt;
    });

    filteredItems.forEach(item => {
      const itemLower = item.name.toLowerCase();
      
      if (produceKeywords.some(k => itemLower.includes(k))) {
        categories['Produce'].push(item);
      } else if (dairyKeywords.some(k => itemLower.includes(k))) {
        categories['Dairy'].push(item);
      } else if (meatKeywords.some(k => itemLower.includes(k))) {
        categories['Meat & Seafood'].push(item);
      } else if (bakeryKeywords.some(k => itemLower.includes(k))) {
        categories['Bakery'].push(item);
      } else if (frozenKeywords.some(k => itemLower.includes(k))) {
        categories['Frozen'].push(item);
      } else if (beverageKeywords.some(k => itemLower.includes(k))) {
        categories['Beverages'].push(item);
      } else {
        categories['Other'].push(item);
      }
    });

    return categories;
  }, [groceryItems, filter, sortBy]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.trim()) {
      addGroceryItem({ name: newItem.trim() });
      setNewItem('');
    }
  };

  const pendingCount = groceryItems.filter(i => !i.checked).length;
  const checkedCount = groceryItems.filter(i => i.checked).length;

  return (
    <div className="grocery-list">
      <div className="grocery-header">
        <h2>🛒 Grocery List</h2>
        <div className="grocery-stats">
          <span className="stat pending">{pendingCount} to buy</span>
          <span className="stat checked">{checkedCount} checked</span>
        </div>
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAddItem} className="add-item-form">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add item..."
          className="add-item-input"
        />
        <button type="submit" className="btn btn-primary">Add</button>
      </form>

      {/* Filters and Sort */}
      <div className="grocery-controls">
        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({groceryItems.length})
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            To Buy ({pendingCount})
          </button>
          <button 
            className={filter === 'checked' ? 'active' : ''}
            onClick={() => setFilter('checked')}
          >
            Checked ({checkedCount})
          </button>
        </div>

        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="added">Recently Added</option>
            <option value="name">Name</option>
            <option value="meal">Meal</option>
          </select>
        </div>

        {checkedCount > 0 && (
          <button 
            className="btn btn-danger"
            onClick={clearCheckedGroceryItems}
          >
            Clear Checked ({checkedCount})
          </button>
        )}
      </div>

      {/* Grocery Items by Category */}
      <div className="grocery-categories">
        {Object.entries(categorizedItems).map(([category, items]) => {
          if (items.length === 0) return null;
          
          return (
            <div key={category} className="grocery-category">
              <h3 className="category-header">
                <span className="category-icon">
                  {category === 'Produce' && '🥬'}
                  {category === 'Dairy' && '🥛'}
                  {category === 'Meat & Seafood' && '🥩'}
                  {category === 'Bakery' && '🍞'}
                  {category === 'Pantry' && '🥫'}
                  {category === 'Frozen' && '🧊'}
                  {category === 'Beverages' && '🥤'}
                  {category === 'Other' && '📦'}
                </span>
                {category}
                <span className="category-count">({items.length})</span>
              </h3>
              
              <ul className="grocery-items">
                {items.map(item => (
                  <li 
                    key={item.id} 
                    className={`grocery-item ${item.checked ? 'checked' : ''}`}
                  >
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleGroceryItem(item.id)}
                      />
                      <span className="checkmark"></span>
                      <span className="item-name">{item.name}</span>
                    </label>
                    
                    {item.fromMeal && (
                      <span className="from-meal" title={`From: ${item.fromMeal}`}>
                        🍽️
                      </span>
                    )}
                    
                    <button 
                      className="remove-btn"
                      onClick={() => removeGroceryItem(item.id)}
                      title="Remove item"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {groceryItems.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🛒</span>
            <h3>Your grocery list is empty</h3>
            <p>Add items manually or generate from your meal plan!</p>
          </div>
        )}
      </div>

      {/* Quick Add Suggestions */}
      <div className="quick-add">
        <h4>Quick Add</h4>
        <div className="quick-add-items">
          {['Milk', 'Eggs', 'Bread', 'Butter', 'Cheese', 'Chicken', 'Rice', 'Pasta'].map(item => (
            <button
              key={item}
              className="quick-add-btn"
              onClick={() => addGroceryItem({ name: item })}
            >
              + {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GroceryList;

import React, { useState, useMemo } from 'react';
import { useFamily } from '../context/FamilyContext';

// Base URL for Vite public assets
const BASE_URL = import.meta.env.BASE_URL || '/';

// Store definitions with local logos from public/Logos folder
const GROCERY_STORES = [
  { 
    id: 'amazon', 
    name: 'Amazon', 
    logo: `${BASE_URL}Logos/Amazon.webp`,
    color: '#FF9900'
  },
  { 
    id: 'costco', 
    name: 'Costco', 
    logo: `${BASE_URL}Logos/costco.webp`,
    color: '#005DAA'
  },
  { 
    id: 'winco', 
    name: 'WinCo', 
    logo: `${BASE_URL}Logos/WinCo-Foods-Logo-Vector.jpg`,
    color: '#E31837'
  },
  { 
    id: 'indian', 
    name: 'Indian Store', 
    logo: null,
    emoji: '🏪',
    color: '#FF9933'
  },
  { 
    id: 'walmart', 
    name: 'Walmart', 
    logo: `${BASE_URL}Logos/walmart.webp`,
    color: '#0071CE'
  },
  { 
    id: 'target', 
    name: 'Target', 
    logo: `${BASE_URL}Logos/Target.webp`,
    color: '#CC0000'
  },
  { 
    id: 'kroger', 
    name: 'Kroger', 
    logo: `${BASE_URL}Logos/kroger.jpg`,
    color: '#D71920'
  },
  { 
    id: 'wholefoods', 
    name: 'Whole Foods', 
    logo: `${BASE_URL}Logos/wholefoods.webp`,
    color: '#00674B'
  }
];

function GroceryList() {
  const { 
    groceryItems, 
    addGroceryItem, 
    toggleGroceryItem, 
    removeGroceryItem,
    clearCheckedGroceryItems,
    updateGroceryItem
  } = useFamily();
  
  const [selectedStore, setSelectedStore] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [showChecked, setShowChecked] = useState(true);
  const [showUncategorized, setShowUncategorized] = useState(false);

  // Group items by store
  const itemsByStore = useMemo(() => {
    const grouped = {};
    GROCERY_STORES.forEach(store => {
      grouped[store.id] = groceryItems.filter(item => item.storeId === store.id);
    });
    // Also include items without a storeId under 'other'
    grouped['other'] = groceryItems.filter(item => !item.storeId);
    return grouped;
  }, [groceryItems]);

  // Get counts per store
  const getStoreCount = (storeId) => {
    const items = itemsByStore[storeId] || [];
    return items.filter(i => !i.checked).length;
  };

  const getTotalPendingCount = (storeId) => {
    const items = itemsByStore[storeId] || [];
    return items.length;
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.trim() && selectedStore) {
      addGroceryItem({ 
        name: newItem.trim(),
        storeId: selectedStore.id
      });
      setNewItem('');
    }
  };

  const handleBackToStores = () => {
    setSelectedStore(null);
    setNewItem('');
  };

  const selectedStoreItems = selectedStore ? (itemsByStore[selectedStore.id] || []) : [];
  const pendingItems = selectedStoreItems.filter(i => !i.checked);
  const checkedItems = selectedStoreItems.filter(i => i.checked);

  // Store Selection View
  if (!selectedStore) {
    return (
      <div className="grocery-list">
        <div className="grocery-header">
          <h2>🛒 Grocery Shopping</h2>
          <p className="grocery-subtitle">Select a store to manage your list</p>
        </div>

        <div className="store-grid">
          {GROCERY_STORES.map(store => {
            const pendingCount = getStoreCount(store.id);
            const totalCount = getTotalPendingCount(store.id);
            
            
            return (
              <button
                key={store.id}
                className="store-card"
                onClick={() => setSelectedStore(store)}
                style={{ '--store-color': store.color }}
              >
                <div className="store-logo-container">
                  {store.logo ? (
                    <img 
                      src={store.logo} 
                      alt={store.name}
                      className="store-logo"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.querySelector('.store-fallback').style.display = 'flex';
                      }}
                    />
                  ) : (
                    <span className="store-emoji">{store.emoji}</span>
                  )}
                  <span 
                    className="store-fallback" 
                    style={{ 
                      display: 'none',
                      backgroundColor: store.color 
                    }}
                  >
                    {store.name.charAt(0)}
                  </span>
                </div>
                <span className="store-name">{store.name}</span>
                {totalCount > 0 && (
                  <div className="store-badge">
                    {pendingCount > 0 ? pendingCount : '✓'}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Show uncategorized items if any */}
        {itemsByStore['other']?.length > 0 && (
          <div className="uncategorized-section">
            <div 
              className="uncategorized-notice clickable"
              onClick={() => setShowUncategorized(!showUncategorized)}
            >
              <p>📦 {itemsByStore['other'].length} items without a store assigned</p>
              <span className="toggle-icon">{showUncategorized ? '▼' : '▶'}</span>
            </div>
            
            {showUncategorized && (
              <div className="uncategorized-items">
                {itemsByStore['other'].map(item => (
                  <div key={item.id} className="uncategorized-item">
                    <span className="item-name">{item.name}</span>
                    <div className="assign-store-buttons">
                      {GROCERY_STORES.map(store => (
                        <button
                          key={store.id}
                          className="assign-btn"
                          onClick={() => updateGroceryItem(item.id, { storeId: store.id })}
                          title={`Move to ${store.name}`}
                          style={{ backgroundColor: store.color }}
                        >
                          {store.name.charAt(0)}
                        </button>
                      ))}
                      <button 
                        className="remove-btn"
                        onClick={() => removeGroceryItem(item.id)}
                        title="Delete item"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Store Items View
  return (
    <div className="grocery-list">
      <div className="grocery-header store-header">
        <button className="back-btn" onClick={handleBackToStores}>
          ← Stores
        </button>
        <div className="store-title">
          {selectedStore.logo ? (
            <img 
              src={selectedStore.logo} 
              alt={selectedStore.name}
              className="store-logo-small"
            />
          ) : (
            <span className="store-emoji-small">{selectedStore.emoji}</span>
          )}
          <h2>{selectedStore.name}</h2>
        </div>
        <div className="grocery-stats">
          <span className="stat pending">{pendingItems.length} to buy</span>
        </div>
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAddItem} className="add-item-form">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={`Add item to ${selectedStore.name}...`}
          className="add-item-input"
          autoFocus
        />
        <button type="submit" className="btn btn-primary" disabled={!newItem.trim()}>
          Add
        </button>
      </form>

      {/* Pending Items */}
      <div className="grocery-section">
        <h3 className="section-title">
          🛒 To Buy ({pendingItems.length})
        </h3>
        
        {pendingItems.length === 0 ? (
          <p className="empty-message">No items to buy. Add some above!</p>
        ) : (
          <ul className="grocery-items">
            {pendingItems.map(item => (
              <li key={item.id} className="grocery-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleGroceryItem(item.id)}
                  />
                  <span className="checkmark"></span>
                  <span className="item-name">{item.name}</span>
                </label>
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
        )}
      </div>

      {/* Checked Items */}
      {checkedItems.length > 0 && (
        <div className="grocery-section checked-section">
          <div className="section-header-row">
            <h3 
              className="section-title clickable"
              onClick={() => setShowChecked(!showChecked)}
            >
              ✅ In Cart ({checkedItems.length})
              <span className="toggle-icon">{showChecked ? '▼' : '▶'}</span>
            </h3>
            <button 
              className="btn btn-sm btn-danger"
              onClick={() => {
                checkedItems.forEach(item => removeGroceryItem(item.id));
              }}
            >
              Clear
            </button>
          </div>
          
          {showChecked && (
            <ul className="grocery-items checked-items">
              {checkedItems.map(item => (
                <li key={item.id} className="grocery-item checked">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleGroceryItem(item.id)}
                    />
                    <span className="checkmark"></span>
                    <span className="item-name">{item.name}</span>
                  </label>
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
          )}
        </div>
      )}
    </div>
  );
}

export default GroceryList;

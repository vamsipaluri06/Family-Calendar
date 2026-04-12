import React, { useState, useMemo } from 'react';
import { useFamily } from '../context/FamilyContext';
import ExpenseModal from './ExpenseModal';

// Base URL for Vite public assets
const BASE_URL = import.meta.env.BASE_URL || '/';

// Store definitions (same as GroceryList)
const GROCERY_STORES = [
  { id: 'amazon', name: 'Amazon', logo: `${BASE_URL}Logos/Amazon.webp`, color: '#FF9900' },
  { id: 'costco', name: 'Costco', logo: `${BASE_URL}Logos/costco.webp`, color: '#005DAA' },
  { id: 'winco', name: 'WinCo', logo: `${BASE_URL}Logos/WinCo-Foods-Logo-Vector.jpg`, color: '#E31837' },
  { id: 'indian', name: 'Indian Store', logo: null, emoji: '🏪', color: '#FF9933' },
  { id: 'walmart', name: 'Walmart', logo: `${BASE_URL}Logos/walmart.webp`, color: '#0071CE' },
  { id: 'target', name: 'Target', logo: `${BASE_URL}Logos/Target.webp`, color: '#CC0000' },
  { id: 'kroger', name: 'Kroger', logo: `${BASE_URL}Logos/kroger.jpg`, color: '#D71920' },
  { id: 'wholefoods', name: 'Whole Foods', logo: `${BASE_URL}Logos/wholefoods.webp`, color: '#00674B' },
  { id: 'misc', name: 'Miscellaneous', logo: null, emoji: '📦', color: '#6B7280' }
];

function ExpenseSummary() {
  const { 
    storeExpenses,
    getMonthlyTotal,
    getAnnualTotal,
    getAllStoresAnnualTotal
  } = useFamily();
  
  const [selectedStore, setSelectedStore] = useState(null);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate totals for each store
  const storeStats = useMemo(() => {
    return GROCERY_STORES.map(store => ({
      ...store,
      monthlyTotal: getMonthlyTotal(store.id, viewYear, viewMonth),
      annualTotal: getAnnualTotal(store.id, viewYear)
    })).sort((a, b) => b.monthlyTotal - a.monthlyTotal);
  }, [storeExpenses, viewYear, viewMonth]);

  const totalMonthly = storeStats.reduce((sum, s) => sum + s.monthlyTotal, 0);
  const totalAnnual = getAllStoresAnnualTotal(viewYear);

  return (
    <div className="expense-summary">
      <div className="expense-summary-header">
        <h2>💰 Expense Summary</h2>
        
        {/* Month/Year Selector */}
        <div className="expense-month-selector">
          <button 
            className="nav-btn"
            onClick={() => {
              if (viewMonth === 0) {
                setViewMonth(11);
                setViewYear(viewYear - 1);
              } else {
                setViewMonth(viewMonth - 1);
              }
            }}
          >
            ←
          </button>
          <span className="current-month">{months[viewMonth]} {viewYear}</span>
          <button 
            className="nav-btn"
            onClick={() => {
              if (viewMonth === 11) {
                setViewMonth(0);
                setViewYear(viewYear + 1);
              } else {
                setViewMonth(viewMonth + 1);
              }
            }}
          >
            →
          </button>
        </div>
      </div>

      {/* Overall Summary Cards */}
      <div className="expense-totals">
        <div className="total-card monthly">
          <span className="total-label">{months[viewMonth]} Total</span>
          <span className="total-value">{formatCurrency(totalMonthly)}</span>
        </div>
        <div className="total-card annual">
          <span className="total-label">{viewYear} Year Total</span>
          <span className="total-value">{formatCurrency(totalAnnual)}</span>
        </div>
      </div>

      {/* Store Breakdown */}
      <div className="store-expense-list">
        <h3>By Store</h3>
        {storeStats.map(store => (
          <div 
            key={store.id} 
            className="store-expense-row"
            onClick={() => setSelectedStore(store)}
          >
            <div className="store-info">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="store-logo-tiny" />
              ) : (
                <span className="store-emoji-tiny">{store.emoji}</span>
              )}
              <span className="store-name">{store.name}</span>
            </div>
            <div className="store-amounts">
              <span className="monthly-amount" style={{ color: store.color }}>
                {formatCurrency(store.monthlyTotal)}
              </span>
              <span className="annual-amount">
                {formatCurrency(store.annualTotal)} ytd
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Store Expense Modal */}
      {selectedStore && (
        <ExpenseModal 
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
        />
      )}
    </div>
  );
}

export default ExpenseSummary;

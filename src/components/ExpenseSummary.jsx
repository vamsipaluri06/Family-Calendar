import React, { useState, useMemo, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import ExpenseModal from './ExpenseModal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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

// Helper to parse a YYYY-MM-DD string as local date (noon to avoid timezone shifts)
const parseLocalDate = (dateStr) => new Date(dateStr + 'T12:00:00');

function ExpenseSummary() {
  const { 
    storeExpenses,
    restaurantExpenses,
    getMonthlyTotal,
    getAnnualTotal,
    getAllStoresAnnualTotal,
    getRestaurantMonthlyTotal,
    getRestaurantAnnualTotal
  } = useFamily();
  
  const [selectedStore, setSelectedStore] = useState(null);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [showMonthDetails, setShowMonthDetails] = useState(false);
  const [showYearDetails, setShowYearDetails] = useState(false);
  const [showStoreList, setShowStoreList] = useState(false);
  const [chartLoaded, setChartLoaded] = useState(false);

  // Lazy load the pie chart with delay for smooth animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setChartLoaded(true);
    }, 2500); // 2.5 second delay
    return () => clearTimeout(timer);
  }, []);

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

  // Restaurant totals
  const restaurantMonthlyTotal = getRestaurantMonthlyTotal(viewYear, viewMonth);
  const restaurantAnnualTotal = getRestaurantAnnualTotal(viewYear);

  // Get all expenses for the selected month (including restaurants)
  const monthlyExpenses = useMemo(() => {
    const storeExp = storeExpenses
      .filter(e => {
        const expenseDate = parseLocalDate(e.date);
        return expenseDate.getFullYear() === viewYear && expenseDate.getMonth() === viewMonth;
      })
      .map(e => ({ ...e, type: 'store' }));
    
    const restaurantExp = restaurantExpenses
      .filter(e => {
        const expenseDate = parseLocalDate(e.date);
        return expenseDate.getFullYear() === viewYear && expenseDate.getMonth() === viewMonth;
      })
      .map(e => ({ ...e, type: 'restaurant' }));
    
    return [...storeExp, ...restaurantExp].sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
  }, [storeExpenses, restaurantExpenses, viewYear, viewMonth]);

  const totalMonthly = storeStats.reduce((sum, s) => sum + s.monthlyTotal, 0) + restaurantMonthlyTotal;
  const totalAnnual = getAllStoresAnnualTotal(viewYear) + restaurantAnnualTotal;

  // Combined stats for pie chart (stores + restaurants)
  const allExpenseStats = useMemo(() => {
    const stats = [...storeStats];
    if (restaurantMonthlyTotal > 0 || restaurantAnnualTotal > 0) {
      stats.push({
        id: 'restaurants',
        name: 'Restaurants',
        logo: `${BASE_URL}Logos/restaurant.png`,
        color: '#FF6B6B',
        monthlyTotal: restaurantMonthlyTotal,
        annualTotal: restaurantAnnualTotal
      });
    }
    return stats.sort((a, b) => b.monthlyTotal - a.monthlyTotal);
  }, [storeStats, restaurantMonthlyTotal, restaurantAnnualTotal]);

  // Get totals for each month of the year (including restaurants)
  const yearlyMonthlyTotals = useMemo(() => {
    return months.map((monthName, monthIndex) => {
      const storeMonthExpenses = storeExpenses.filter(e => {
        const expenseDate = parseLocalDate(e.date);
        return expenseDate.getFullYear() === viewYear && expenseDate.getMonth() === monthIndex;
      });
      const restaurantMonthExpenses = restaurantExpenses.filter(e => {
        const expenseDate = parseLocalDate(e.date);
        return expenseDate.getFullYear() === viewYear && expenseDate.getMonth() === monthIndex;
      });
      const storeTotal = storeMonthExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      const restaurantTotal = restaurantMonthExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      return {
        month: monthName,
        monthIndex,
        total: storeTotal + restaurantTotal,
        expenseCount: storeMonthExpenses.length + restaurantMonthExpenses.length
      };
    });
  }, [storeExpenses, restaurantExpenses, viewYear]);

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
        <div 
          className="total-card monthly clickable"
          onClick={() => setShowMonthDetails(true)}
          title="Click to view all expenses"
        >
          <span className="total-label">{months[viewMonth]} Total</span>
          <span className="total-value">{formatCurrency(totalMonthly)}</span>
          <span className="click-hint">Click to view details</span>
        </div>
        <div 
          className="total-card annual clickable"
          onClick={() => setShowYearDetails(true)}
          title="Click to view monthly breakdown"
        >
          <span className="total-label">{viewYear} Year Total</span>
          <span className="total-value">{formatCurrency(totalAnnual)}</span>
          <span className="click-hint">Click to view details</span>
        </div>
      </div>

      {/* Store Breakdown - Pie Chart */}
      <div className="store-expense-chart">
        {allExpenseStats.filter(s => s.monthlyTotal > 0).length === 0 ? (
          <p className="no-expenses" style={{ textAlign: 'center', padding: '2rem' }}>No expenses recorded for {months[viewMonth]}</p>
        ) : !chartLoaded ? (
          /* Loading skeleton while chart loads */
          <div className="pie-chart-loading">
            <div className="pie-chart-skeleton">
              <div className="skeleton-ring"></div>
              <div className="skeleton-center">
                <div className="skeleton-text"></div>
                <div className="skeleton-text"></div>
              </div>
            </div>
            <p className="loading-text">Loading chart</p>
          </div>
        ) : (
          <div 
            className="pie-chart-container pie-chart-fade-in" 
            onClick={() => setShowStoreList(true)}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={allExpenseStats.filter(s => s.monthlyTotal > 0).map(store => ({
                    name: store.name,
                    value: store.monthlyTotal,
                    color: store.color,
                    id: store.id
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth={2}
                  animationBegin={200}
                  animationDuration={1200}
                  animationEasing="ease-out"
                  startAngle={90}
                  endAngle={-270}
                >
                  {allExpenseStats.filter(s => s.monthlyTotal > 0).map((store, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={store.color}
                      style={{ filter: 'drop-shadow(0px 3px 6px rgba(0,0,0,0.25))' }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Spent']}
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-primary, #fff)', 
                    border: '1px solid var(--border-color, #e5e7eb)',
                    borderRadius: '12px',
                    color: 'var(--text-primary, #333)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    padding: '12px 16px'
                  }}
                  labelStyle={{ fontWeight: '600', marginBottom: '4px' }}
                />
                <Legend 
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    paddingTop: '10px'
                  }}
                  formatter={(value, entry) => (
                    <span style={{ 
                      color: 'var(--text-primary, #333)', 
                      fontWeight: '500',
                      fontSize: '13px'
                    }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Total - HTML Overlay */}
            <div className="pie-center-label">
              <span className="pie-center-amount">{formatCurrency(totalMonthly)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Store List Modal */}
      {showStoreList && (
        <div className="modal-overlay" onClick={() => setShowStoreList(false)}>
          <div className="expense-modal month-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="expense-modal-header">
              <h2>🏪 Expense Breakdown - {months[viewMonth]} {viewYear}</h2>
              <button className="modal-close" onClick={() => setShowStoreList(false)}>×</button>
            </div>
            
            <div className="month-expense-summary">
              <span className="expense-count">{allExpenseStats.filter(s => s.monthlyTotal > 0).length} categor{allExpenseStats.filter(s => s.monthlyTotal > 0).length !== 1 ? 'ies' : 'y'}</span>
              <span className="expense-total">{formatCurrency(totalMonthly)}</span>
            </div>

            <div className="store-expense-list">
              {allExpenseStats.map(store => (
                <div 
                  key={store.id} 
                  className="store-expense-row"
                  onClick={() => {
                    if (store.id !== 'restaurants') {
                      setSelectedStore(store);
                      setShowStoreList(false);
                    }
                  }}
                  style={{ cursor: store.id !== 'restaurants' ? 'pointer' : 'default' }}
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
          </div>
        </div>
      )}

      {/* Store Expense Modal */}
      {selectedStore && (
        <ExpenseModal 
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
        />
      )}

      {/* Monthly Expenses Detail Modal */}
      {showMonthDetails && (
        <div className="modal-overlay" onClick={() => setShowMonthDetails(false)}>
          <div className="expense-modal month-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="expense-modal-header">
              <h2>📋 {months[viewMonth]} {viewYear} Expenses</h2>
              <button className="modal-close" onClick={() => setShowMonthDetails(false)}>×</button>
            </div>
            
            <div className="month-expense-summary">
              <span className="expense-count">{monthlyExpenses.length} expense{monthlyExpenses.length !== 1 ? 's' : ''}</span>
              <span className="expense-total">{formatCurrency(totalMonthly)}</span>
            </div>

            <div className="month-expense-list">
              {monthlyExpenses.length === 0 ? (
                <p className="no-expenses">No expenses recorded for {months[viewMonth]}</p>
              ) : (
                monthlyExpenses.map(expense => {
                  const store = expense.type === 'restaurant' 
                    ? { name: expense.restaurantName, logo: `${BASE_URL}Logos/restaurant.png`, color: '#FF6B6B' }
                    : GROCERY_STORES.find(s => s.id === expense.storeId);
                  const expenseDate = parseLocalDate(expense.date);
                  return (
                    <div key={expense.id} className="month-expense-item">
                      <div className="expense-date">
                        {expenseDate.toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="expense-store-info">
                        {store?.logo ? (
                          <img src={store.logo} alt={store?.name} className="store-logo-tiny" />
                        ) : (
                          <span className="store-emoji-tiny">{store?.emoji || '📦'}</span>
                        )}
                        <span className="expense-store-name">{store?.name || 'Unknown'}</span>
                      </div>
                      {expense.note && (
                        <div className="expense-note">{expense.note}</div>
                      )}
                      <div className="expense-amount" style={{ color: store?.color || '#333' }}>
                        {formatCurrency(expense.amount)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Year Details Modal - Monthly Breakdown */}
      {showYearDetails && (
        <div className="modal-overlay" onClick={() => setShowYearDetails(false)}>
          <div className="expense-modal month-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="expense-modal-header">
              <h2>📊 {viewYear} Monthly Breakdown</h2>
              <button className="modal-close" onClick={() => setShowYearDetails(false)}>×</button>
            </div>
            
            <div className="month-expense-summary">
              <span className="expense-count">{yearlyMonthlyTotals.filter(m => m.total > 0).length} month{yearlyMonthlyTotals.filter(m => m.total > 0).length !== 1 ? 's' : ''} with expenses</span>
              <span className="expense-total">{formatCurrency(totalAnnual)}</span>
            </div>

            <div className="month-expense-list year-breakdown">
              {yearlyMonthlyTotals.filter(m => m.total > 0).length === 0 ? (
                <p className="no-expenses">No expenses recorded for {viewYear}</p>
              ) : (
                yearlyMonthlyTotals
                  .filter(monthData => monthData.total > 0)
                  .map((monthData) => (
                    <div 
                      key={monthData.monthIndex} 
                      className="year-month-item has-expenses"
                      onClick={() => {
                        setViewMonth(monthData.monthIndex);
                        setShowYearDetails(false);
                        setShowMonthDetails(true);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="year-month-name">{monthData.month}</div>
                      <div className="year-month-stats">
                        <span className="year-month-count">{monthData.expenseCount} expense{monthData.expenseCount !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="year-month-total has-amount">
                        {formatCurrency(monthData.total)}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpenseSummary;

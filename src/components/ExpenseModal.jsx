import React, { useState, useEffect, useMemo } from 'react';
import { useFamily } from '../context/FamilyContext';

// Helper to format date as YYYY-MM-DD in local time
const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to parse a YYYY-MM-DD string as local date (noon to avoid timezone shifts)
const parseLocalDate = (dateStr) => new Date(dateStr + 'T12:00:00');

function ExpenseModal({ store, onClose }) {
  const { 
    storeExpenses,
    addStoreExpense, 
    removeStoreExpense,
    getMonthlyTotal,
    getAnnualTotal,
    getAllStoresAnnualTotal
  } = useFamily();
  
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(formatDateLocal(new Date()));
  const [note, setNote] = useState('');
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get expenses for the selected month
  const monthlyExpenses = useMemo(() => {
    return storeExpenses
      .filter(e => {
        if (e.storeId !== store.id) return false;
        const expenseDate = parseLocalDate(e.date);
        return expenseDate.getFullYear() === viewYear && expenseDate.getMonth() === viewMonth;
      })
      .sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
  }, [storeExpenses, store.id, viewYear, viewMonth]);

  const monthlyTotal = getMonthlyTotal(store.id, viewYear, viewMonth);
  const annualTotal = getAnnualTotal(store.id, viewYear);
  const allStoresAnnualTotal = getAllStoresAnnualTotal(viewYear);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    await addStoreExpense({
      storeId: store.id,
      storeName: store.name,
      amount: parseFloat(amount),
      date,
      note: note.trim()
    });

    setAmount('');
    setNote('');
    setDate(formatDateLocal(new Date()));
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Delete this expense?')) {
      await removeStoreExpense(expenseId);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateStr) => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal expense-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="store-logo-small" />
            ) : (
              <span className="store-emoji-small">{store.emoji}</span>
            )}
            {store.name}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="expense-modal-content">
          {/* Summary Cards */}
          <div className="expense-summary-cards">
            <div className="summary-card monthly" style={{ borderColor: store.color }}>
              <span className="summary-label">{months[viewMonth]} {viewYear}</span>
              <span className="summary-value">{formatCurrency(monthlyTotal)}</span>
            </div>
            <div className="summary-card annual" style={{ borderColor: store.color }}>
              <span className="summary-label">{viewYear} Total</span>
              <span className="summary-value">{formatCurrency(annualTotal)}</span>
            </div>
          </div>

          {/* Add Expense Form */}
          <form onSubmit={handleSubmit} className="expense-form">
            <div className="form-row">
              <div className="form-group">
                <label>Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group flex-grow">
                <label>Note (optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g., Weekly groceries"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={!amount}>
                Add
              </button>
            </div>
          </form>

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

          {/* Expense History */}
          <div className="expense-history">
            <h3>History ({monthlyExpenses.length} entries)</h3>
            
            {monthlyExpenses.length === 0 ? (
              <p className="empty-message">No expenses recorded for {months[viewMonth]} {viewYear}</p>
            ) : (
              <ul className="expense-list">
                {monthlyExpenses.map(expense => (
                  <li key={expense.id} className="expense-item">
                    <div className="expense-info">
                      <span className="expense-date">{formatDate(expense.date)}</span>
                      {expense.note && <span className="expense-note">{expense.note}</span>}
                    </div>
                    <div className="expense-actions">
                      <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                      <button 
                        className="remove-btn"
                        onClick={() => handleDelete(expense.id)}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* All Stores Summary */}
          <div className="all-stores-summary">
            <span>All Stores {viewYear} Total:</span>
            <strong>{formatCurrency(allStoresAnnualTotal)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpenseModal;

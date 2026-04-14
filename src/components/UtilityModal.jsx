import React, { useState, useMemo } from 'react';
import { useFamily } from '../context/FamilyContext';

function UtilityModal({ utility, onClose }) {
  const { 
    utilityBills,
    addUtilityBill, 
    removeUtilityBill,
    updateUtilityBill,
    getUtilityMonthlyTotal,
    getUtilityAnnualTotal,
    getAllUtilitiesAnnualTotal
  } = useFamily();
  
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [isPaid, setIsPaid] = useState(true);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get bills for the selected month
  const monthlyBills = useMemo(() => {
    return utilityBills
      .filter(b => {
        if (b.utilityId !== utility.id) return false;
        // Parse date as local time to avoid timezone issues
        const [year, month] = b.date.split('-').map(Number);
        return year === viewYear && (month - 1) === viewMonth;
      })
      .sort((a, b) => new Date(b.date + 'T00:00:00') - new Date(a.date + 'T00:00:00'));
  }, [utilityBills, utility.id, viewYear, viewMonth]);

  const monthlyTotal = getUtilityMonthlyTotal(utility.id, viewYear, viewMonth);
  const annualTotal = getUtilityAnnualTotal(utility.id, viewYear);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    await addUtilityBill({
      utilityId: utility.id,
      utilityName: utility.name,
      amount: parseFloat(amount),
      date,
      note: note.trim(),
      isPaid
    });

    setAmount('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsPaid(true);
  };

  const handleDelete = async (billId) => {
    if (window.confirm('Delete this bill entry?')) {
      await removeUtilityBill(billId);
    }
  };

  const handleTogglePaid = async (bill) => {
    await updateUtilityBill(bill.id, { isPaid: !bill.isPaid });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateStr) => {
    // Parse as local time to avoid timezone issues
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal utility-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span 
              className="utility-icon-header"
              style={{ backgroundColor: utility.color + '20', color: utility.color }}
            >
              {utility.icon}
            </span>
            {utility.name}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="utility-modal-content">
          {/* Summary Cards */}
          <div className="expense-summary-cards">
            <div className="summary-card monthly" style={{ borderColor: utility.color }}>
              <span className="summary-label">{months[viewMonth]} {viewYear}</span>
              <span className="summary-value">{formatCurrency(monthlyTotal)}</span>
            </div>
            <div className="summary-card annual" style={{ borderColor: utility.color }}>
              <span className="summary-label">{viewYear} Total</span>
              <span className="summary-value">{formatCurrency(annualTotal)}</span>
            </div>
          </div>

          {/* Add Bill Form */}
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
                  placeholder="e.g., April bill"
                />
              </div>
              <div className="form-group paid-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                  />
                  Paid
                </label>
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

          {/* Bills List */}
          <div className="bills-list">
            {monthlyBills.length === 0 ? (
              <p className="no-bills">No bills recorded for {months[viewMonth]} {viewYear}</p>
            ) : (
              monthlyBills.map(bill => (
                <div 
                  key={bill.id} 
                  className={`bill-item ${bill.isPaid ? 'paid' : 'unpaid'}`}
                >
                  <div className="bill-info">
                    <span className="bill-date">{formatDate(bill.date)}</span>
                    {bill.note && <span className="bill-note">{bill.note}</span>}
                    <span 
                      className={`bill-status ${bill.isPaid ? 'paid' : 'unpaid'}`}
                      onClick={() => handleTogglePaid(bill)}
                    >
                      {bill.isPaid ? '✓ Paid' : '○ Unpaid'}
                    </span>
                  </div>
                  <div className="bill-actions">
                    <span className="bill-amount" style={{ color: utility.color }}>
                      {formatCurrency(bill.amount)}
                    </span>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(bill.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Year Summary */}
          <div className="year-summary">
            <h4>{viewYear} Monthly Breakdown</h4>
            <div className="month-breakdown">
              {months.map((monthName, idx) => {
                const monthTotal = getUtilityMonthlyTotal(utility.id, viewYear, idx);
                const isCurrentMonth = idx === viewMonth;
                return (
                  <div 
                    key={idx} 
                    className={`month-bar ${isCurrentMonth ? 'current' : ''}`}
                    onClick={() => setViewMonth(idx)}
                  >
                    <span className="month-label">{monthName.substring(0, 3)}</span>
                    <span 
                      className="month-value" 
                      style={{ color: monthTotal > 0 ? utility.color : '#999' }}
                    >
                      {monthTotal > 0 ? formatCurrency(monthTotal) : '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UtilityModal;

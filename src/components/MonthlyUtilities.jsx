import React, { useState, useMemo } from 'react';
import { useFamily } from '../context/FamilyContext';
import UtilityModal from './UtilityModal';

function MonthlyUtilities() {
  const { 
    utilityBills,
    UTILITY_TYPES,
    getUtilityMonthlyTotal,
    getUtilityAnnualTotal,
    getAllUtilitiesMonthlyTotal,
    getAllUtilitiesAnnualTotal
  } = useFamily();
  
  const [selectedUtility, setSelectedUtility] = useState(null);
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

  // Calculate totals for each utility
  const utilityStats = useMemo(() => {
    return UTILITY_TYPES.map(utility => ({
      ...utility,
      monthlyTotal: getUtilityMonthlyTotal(utility.id, viewYear, viewMonth),
      annualTotal: getUtilityAnnualTotal(utility.id, viewYear)
    })).sort((a, b) => b.monthlyTotal - a.monthlyTotal);
  }, [utilityBills, viewYear, viewMonth, UTILITY_TYPES, getUtilityMonthlyTotal, getUtilityAnnualTotal]);

  const totalMonthly = getAllUtilitiesMonthlyTotal(viewYear, viewMonth);
  const totalAnnual = getAllUtilitiesAnnualTotal(viewYear);

  return (
    <div className="monthly-utilities">
      <div className="utilities-header">
        <h2>🏠 Monthly Utilities</h2>
        
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

      {/* Utility Breakdown */}
      <div className="utility-list">
        <h3>Monthly Bills</h3>
        {utilityStats.map(utility => (
          <div 
            key={utility.id} 
            className="utility-row"
            onClick={() => setSelectedUtility(utility)}
          >
            <div className="utility-info">
              <span 
                className="utility-icon" 
                style={{ backgroundColor: utility.color + '20', color: utility.color }}
              >
                {utility.icon}
              </span>
              <span className="utility-name">{utility.name}</span>
            </div>
            <div className="utility-amounts">
              <span className="monthly-amount" style={{ color: utility.color }}>
                {formatCurrency(utility.monthlyTotal)}
              </span>
              <span className="annual-amount">
                {formatCurrency(utility.annualTotal)} ytd
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="utility-quick-stats">
        <h3>Average Monthly Cost</h3>
        <div className="quick-stats-grid">
          {UTILITY_TYPES.map(utility => {
            const annualTotal = getUtilityAnnualTotal(utility.id, viewYear);
            const monthsWithData = utilityBills.filter(b => {
              // Parse date as local time to avoid timezone issues
              const [year] = b.date.split('-').map(Number);
              return b.utilityId === utility.id && year === viewYear;
            }).length;
            const avgMonthly = monthsWithData > 0 ? annualTotal / Math.min(monthsWithData, viewMonth + 1) : 0;
            
            return (
              <div key={utility.id} className="quick-stat-item">
                <span className="stat-icon">{utility.icon}</span>
                <span className="stat-value">{formatCurrency(avgMonthly)}</span>
                <span className="stat-label">avg/month</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Utility Modal */}
      {selectedUtility && (
        <UtilityModal 
          utility={selectedUtility}
          onClose={() => setSelectedUtility(null)}
        />
      )}
    </div>
  );
}

export default MonthlyUtilities;

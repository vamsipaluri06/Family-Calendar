import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';

// Base URL for Vite public assets
const BASE_URL = import.meta.env.BASE_URL || '/';

// Store definitions (same as GroceryList/ExpenseSummary)
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

// Banks with their branding
const BANKS = [
  { id: 'chase', name: 'Chase', color: '#117ACA', logo: '🏦' },
  { id: 'amex', name: 'American Express', color: '#006FCF', logo: '💳' },
  { id: 'boa', name: 'Bank of America', color: '#E31837', logo: '🏦' },
  { id: 'citi', name: 'Citi', color: '#003B70', logo: '🏦' },
  { id: 'discover', name: 'Discover', color: '#FF6600', logo: '💳' },
  { id: 'other', name: 'Other', color: '#6B7280', logo: '💳' },
];

// Credit card database with pre-populated rewards
const CREDIT_CARD_DATABASE = {
  chase: [
    {
      id: 'chase-freedom-flex',
      name: 'Chase Freedom Flex',
      color: '#117ACA',
      rewards: [
        { categoryId: 'dining', rewardRate: '3' },
        { categoryId: 'drugstore', rewardRate: '3' },
        { categoryId: 'travel', rewardRate: '5' },
        { categoryId: 'all', rewardRate: '1' },
      ],
      note: '5% on rotating quarterly categories (activate required)'
    },
    {
      id: 'chase-freedom-unlimited',
      name: 'Chase Freedom Unlimited',
      color: '#117ACA',
      rewards: [
        { categoryId: 'dining', rewardRate: '3' },
        { categoryId: 'drugstore', rewardRate: '3' },
        { categoryId: 'travel', rewardRate: '5' },
        { categoryId: 'all', rewardRate: '1.5' },
      ],
      note: '1.5% unlimited cashback on all purchases'
    },
    {
      id: 'chase-sapphire-preferred',
      name: 'Chase Sapphire Preferred',
      color: '#1A1F71',
      rewards: [
        { categoryId: 'dining', rewardRate: '3' },
        { categoryId: 'streaming', rewardRate: '3' },
        { categoryId: 'online', rewardRate: '3' },
        { categoryId: 'travel', rewardRate: '5' },
        { categoryId: 'all', rewardRate: '1' },
      ],
      note: 'Points worth 25% more on travel redemption'
    },
    {
      id: 'chase-sapphire-reserve',
      name: 'Chase Sapphire Reserve',
      color: '#1F2937',
      rewards: [
        { categoryId: 'dining', rewardRate: '3' },
        { categoryId: 'travel', rewardRate: '10' },
        { categoryId: 'all', rewardRate: '1' },
      ],
      note: 'Points worth 50% more on travel redemption, $300 travel credit'
    },
    {
      id: 'chase-amazon-prime',
      name: 'Amazon Prime Rewards Visa',
      color: '#1F2937',
      rewards: [
        { categoryId: 'online', rewardRate: '5' },
        { categoryId: 'groceries', rewardRate: '2' },
        { categoryId: 'dining', rewardRate: '2' },
        { categoryId: 'gas', rewardRate: '2' },
        { categoryId: 'all', rewardRate: '1' },
      ],
      note: '5% back at Amazon & Whole Foods with Prime'
    },
  ],
  amex: [
    {
      id: 'amex-blue-cash-everyday',
      name: 'Blue Cash Everyday',
      color: '#006FCF',
      rewards: [
        { categoryId: 'groceries', rewardRate: '3' },
        { categoryId: 'online', rewardRate: '3' },
        { categoryId: 'gas', rewardRate: '3' },
        { categoryId: 'all', rewardRate: '1' },
      ],
      note: '3% at U.S. supermarkets (up to $6k/year)'
    },
    {
      id: 'amex-blue-cash-preferred',
      name: 'Blue Cash Preferred',
      color: '#006FCF',
      rewards: [
        { categoryId: 'groceries', rewardRate: '6' },
        { categoryId: 'streaming', rewardRate: '6' },
        { categoryId: 'gas', rewardRate: '3' },
        { categoryId: 'travel', rewardRate: '3' },
        { categoryId: 'all', rewardRate: '1' },
      ],
      note: '6% at U.S. supermarkets (up to $6k/year), $95 annual fee'
    },
    {
      id: 'amex-gold',
      name: 'American Express Gold Card',
      color: '#B8860B',
      rewards: [
        { categoryId: 'dining', rewardRate: '4' },
        { categoryId: 'groceries', rewardRate: '4' },
        { categoryId: 'travel', rewardRate: '3' },
        { categoryId: 'all', rewardRate: '1' },
      ],
      note: '4X points at restaurants & U.S. supermarkets'
    },
    {
      id: 'amex-platinum',
      name: 'American Express Platinum',
      color: '#E5E4E2',
      rewards: [
        { categoryId: 'travel', rewardRate: '5' },
        { categoryId: 'all', rewardRate: '1' },
      ],
      note: '5X on flights, hotel & airline credits'
    },
    {
      id: 'amex-cash-magnet',
      name: 'Cash Magnet Card',
      color: '#006FCF',
      rewards: [
        { categoryId: 'all', rewardRate: '1.5' },
      ],
      note: 'Unlimited 1.5% cash back'
    },
  ],
  boa: [
    {
      id: 'boa-customized-cash',
      name: 'Customized Cash Rewards',
      color: '#E31837',
      rewards: [
        { categoryId: 'groceries', rewardRate: '3' },
        { categoryId: 'gas', rewardRate: '3' },
        { categoryId: 'online', rewardRate: '3' },
        { categoryId: 'dining', rewardRate: '3' },
        { categoryId: 'all', rewardRate: '1' },
      ],
      note: '3% in category of choice, 2% at grocery/wholesale clubs'
    },
    {
      id: 'boa-unlimited-cash',
      name: 'Unlimited Cash Rewards',
      color: '#E31837',
      rewards: [
        { categoryId: 'all', rewardRate: '1.5' },
      ],
      note: '1.5% unlimited cash back, can be boosted with Preferred Rewards'
    },
    {
      id: 'boa-premium-rewards',
      name: 'Premium Rewards',
      color: '#1F2937',
      rewards: [
        { categoryId: 'travel', rewardRate: '2' },
        { categoryId: 'dining', rewardRate: '2' },
        { categoryId: 'all', rewardRate: '1.5' },
      ],
      note: '2 points on travel and dining, $100 airline credit'
    },
    {
      id: 'boa-travel-rewards',
      name: 'Travel Rewards',
      color: '#003087',
      rewards: [
        { categoryId: 'all', rewardRate: '1.5' },
      ],
      note: '1.5 points per $1, no foreign transaction fees'
    },
  ],
  citi: [
    {
      id: 'citi-double-cash',
      name: 'Citi Double Cash',
      color: '#003B70',
      rewards: [
        { categoryId: 'all', rewardRate: '2' },
      ],
      note: '2% on all purchases (1% when you buy + 1% when you pay)'
    },
    {
      id: 'citi-custom-cash',
      name: 'Citi Custom Cash',
      color: '#003B70',
      rewards: [
        { categoryId: 'groceries', rewardRate: '5' },
        { categoryId: 'gas', rewardRate: '5' },
        { categoryId: 'dining', rewardRate: '5' },
        { categoryId: 'travel', rewardRate: '5' },
        { categoryId: 'streaming', rewardRate: '5' },
        { categoryId: 'all', rewardRate: '1' },
      ],
      note: '5% on top eligible spend category (up to $500/month)'
    },
    {
      id: 'citi-premier',
      name: 'Citi Premier',
      color: '#1F2937',
      rewards: [
        { categoryId: 'dining', rewardRate: '3' },
        { categoryId: 'groceries', rewardRate: '3' },
        { categoryId: 'gas', rewardRate: '3' },
        { categoryId: 'travel', rewardRate: '3' },
        { categoryId: 'all', rewardRate: '1' },
      ],
      note: '3X points on travel, dining, gas stations, supermarkets'
    },
    {
      id: 'costco-anywhere',
      name: 'Costco Anywhere Visa',
      color: '#005DAA',
      rewards: [
        { categoryId: 'gas', rewardRate: '4' },
        { categoryId: 'travel', rewardRate: '3' },
        { categoryId: 'dining', rewardRate: '3' },
        { categoryId: 'wholesale', rewardRate: '2' },
        { categoryId: 'all', rewardRate: '1' },
      ],
      note: '4% on gas (up to $7k/year), 2% at Costco'
    },
  ],
  discover: [
    {
      id: 'discover-it-cash-back',
      name: 'Discover it Cash Back',
      color: '#FF6600',
      rewards: [
        { categoryId: 'all', rewardRate: '1' },
      ],
      note: '5% on rotating quarterly categories (activate required), 1% all else. Cashback Match first year!'
    },
    {
      id: 'discover-it-miles',
      name: 'Discover it Miles',
      color: '#FF6600',
      rewards: [
        { categoryId: 'all', rewardRate: '1.5' },
      ],
      note: '1.5X miles on all purchases, Miles Match first year!'
    },
    {
      id: 'discover-it-chrome',
      name: 'Discover it Chrome',
      color: '#C0C0C0',
      rewards: [
        { categoryId: 'gas', rewardRate: '2' },
        { categoryId: 'dining', rewardRate: '2' },
        { categoryId: 'all', rewardRate: '1' },
      ],
      note: '2% at gas stations and restaurants'
    },
    {
      id: 'discover-it-student',
      name: 'Discover it Student Cash Back',
      color: '#FF6600',
      rewards: [
        { categoryId: 'all', rewardRate: '1' },
      ],
      note: '5% on rotating categories, Good Grades reward'
    },
  ],
  other: [
    {
      id: 'custom-card',
      name: 'Custom Card',
      color: '#6B7280',
      rewards: [],
      note: 'Add your own rewards manually'
    },
  ],
};

// Card colors for visual distinction
const CARD_COLORS = [
  { id: 'blue', name: 'Blue', color: '#1E40AF' },
  { id: 'red', name: 'Red', color: '#DC2626' },
  { id: 'green', name: 'Green', color: '#059669' },
  { id: 'purple', name: 'Purple', color: '#7C3AED' },
  { id: 'orange', name: 'Orange', color: '#EA580C' },
  { id: 'black', name: 'Black', color: '#1F2937' },
  { id: 'gold', name: 'Gold', color: '#B45309' },
  { id: 'teal', name: 'Teal', color: '#0D9488' },
];

function CreditCards() {
  const { 
    creditCards, 
    REWARD_CATEGORIES,
    addCreditCard, 
    updateCreditCard, 
    removeCreditCard,
    getBestCardForStore,
    getAllCardsForStore,
    getStorePaymentRules
  } = useFamily();

  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations' | 'cards'
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedCardTemplate, setSelectedCardTemplate] = useState('');
  const [cardForm, setCardForm] = useState({
    name: '',
    bank: '',
    lastFourDigits: '',
    color: CARD_COLORS[0].color,
    rewards: [],
    note: ''
  });

  const resetForm = () => {
    setCardForm({
      name: '',
      bank: '',
      lastFourDigits: '',
      color: CARD_COLORS[0].color,
      rewards: [],
      note: ''
    });
    setSelectedBank('');
    setSelectedCardTemplate('');
    setEditingCard(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditCard = (card) => {
    setCardForm({
      name: card.name || '',
      bank: card.bank || '',
      lastFourDigits: card.lastFourDigits || '',
      color: card.color || CARD_COLORS[0].color,
      rewards: card.rewards || [],
      note: card.note || ''
    });
    setSelectedBank(card.bank || '');
    setSelectedCardTemplate('');
    setEditingCard(card);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleBankSelect = (bankId) => {
    setSelectedBank(bankId);
    setSelectedCardTemplate('');
    // Reset form but keep bank selection
    setCardForm(prev => ({
      ...prev,
      name: '',
      bank: bankId,
      rewards: [],
      note: ''
    }));
  };

  const handleCardTemplateSelect = (cardId) => {
    setSelectedCardTemplate(cardId);
    const template = CREDIT_CARD_DATABASE[selectedBank]?.find(c => c.id === cardId);
    if (template) {
      setCardForm(prev => ({
        ...prev,
        name: template.name,
        bank: selectedBank,
        color: template.color || prev.color,
        rewards: [...template.rewards],
        note: template.note || ''
      }));
    }
  };

  const handleAddReward = () => {
    setCardForm(prev => ({
      ...prev,
      rewards: [...prev.rewards, { categoryId: 'all', rewardRate: '1' }]
    }));
  };

  const handleRemoveReward = (index) => {
    setCardForm(prev => ({
      ...prev,
      rewards: prev.rewards.filter((_, i) => i !== index)
    }));
  };

  const handleRewardChange = (index, field, value) => {
    setCardForm(prev => ({
      ...prev,
      rewards: prev.rewards.map((r, i) => 
        i === index ? { ...r, [field]: value } : r
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cardForm.name.trim()) return;

    const cardData = {
      name: cardForm.name.trim(),
      bank: cardForm.bank,
      lastFourDigits: cardForm.lastFourDigits.trim(),
      color: cardForm.color,
      rewards: cardForm.rewards.filter(r => r.rewardRate && parseFloat(r.rewardRate) > 0),
      note: cardForm.note
    };

    if (editingCard) {
      await updateCreditCard(editingCard.id, cardData);
    } else {
      await addCreditCard(cardData);
    }
    handleCloseModal();
  };

  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Are you sure you want to delete this credit card?')) {
      await removeCreditCard(cardId);
    }
  };

  return (
    <div className="credit-cards-page">
      <div className="credit-cards-header">
        <h2>💳 Credit Cards & Rewards</h2>
        <button className="add-card-btn" onClick={handleOpenAddModal}>
          + Add Card
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="credit-cards-tabs">
        <button 
          className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          🏆 Store Recommendations
        </button>
        <button 
          className={`tab-btn ${activeTab === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveTab('cards')}
        >
          💳 My Cards ({creditCards.length})
        </button>
      </div>

      {/* Store Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="store-recommendations">
          {creditCards.length === 0 ? (
            <div className="no-cards-message">
              <p>Add your credit cards to see the best card to use at each store!</p>
              <button className="add-card-link" onClick={handleOpenAddModal}>
                + Add Your First Card
              </button>
            </div>
          ) : (
            <div className="store-list">
              {GROCERY_STORES.map(store => {
                const bestCard = getBestCardForStore(store.id);
                const allCards = getAllCardsForStore(store.id);
                const paymentRules = getStorePaymentRules(store.id);
                
                return (
                  <div key={store.id} className="store-recommendation-card">
                    <div className="store-header">
                      {store.logo ? (
                        <img src={store.logo} alt={store.name} className="store-logo-small" />
                      ) : (
                        <span className="store-emoji">{store.emoji}</span>
                      )}
                      <span className="store-name">{store.name}</span>
                      {paymentRules && (
                        <span className={`payment-rule-badge ${paymentRules.noCreditCards ? 'cash-only' : 'visa-only'}`}>
                          {paymentRules.noCreditCards ? '💵 Cash/Debit' : '💳 Visa Only'}
                        </span>
                      )}
                    </div>
                    
                    {bestCard?.noCreditCards ? (
                      <div className="no-credit-cards-notice">
                        <span className="notice-icon">💵</span>
                        <div className="notice-text">
                          <strong>Cash or Debit Only</strong>
                          <span>This store does not accept credit cards</span>
                        </div>
                      </div>
                    ) : bestCard?.card ? (
                      <div className="best-card-section">
                        <div className="best-card-label">Best Card:</div>
                        <div 
                          className="recommended-card"
                          style={{ backgroundColor: bestCard.card.color }}
                        >
                          <div className="card-name">{bestCard.card.name}</div>
                          <div className="card-reward">
                            {bestCard.rewardRate}% {bestCard.category?.name || 'cashback'}
                          </div>
                          {bestCard.card.lastFourDigits && (
                            <div className="card-digits">•••• {bestCard.card.lastFourDigits}</div>
                          )}
                        </div>
                        
                        {allCards.length > 1 && (
                          <div className="other-cards">
                            <span className="other-cards-label">Other options:</span>
                            {allCards.slice(1, 3).map((cardInfo, idx) => (
                              <span key={idx} className="other-card-chip">
                                {cardInfo.card.name} ({cardInfo.rewardRate}%)
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : paymentRules?.acceptedNetworks ? (
                      <div className="no-recommendation">
                        <span className="no-card-text">No {paymentRules.acceptedNetworks.join('/')} card added yet</span>
                      </div>
                    ) : (
                      <div className="no-recommendation">
                        <span className="no-card-text">No card configured for this store</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* My Cards Tab */}
      {activeTab === 'cards' && (
        <div className="my-cards-list">
          {creditCards.length === 0 ? (
            <div className="no-cards-message">
              <p>You haven't added any credit cards yet.</p>
              <button className="add-card-link" onClick={handleOpenAddModal}>
                + Add Your First Card
              </button>
            </div>
          ) : (
            creditCards.map(card => {
              const bank = BANKS.find(b => b.id === card.bank);
              return (
              <div key={card.id} className="credit-card-item">
                <div 
                  className="card-visual"
                  style={{ backgroundColor: card.color }}
                >
                  {bank && (
                    <div className="card-bank-badge">{bank.name}</div>
                  )}
                  <div className="card-chip">💳</div>
                  <div className="card-name">{card.name}</div>
                  {card.lastFourDigits && (
                    <div className="card-number">•••• •••• •••• {card.lastFourDigits}</div>
                  )}
                </div>
                
                <div className="card-rewards-list">
                  <h4>Rewards:</h4>
                  {card.rewards && card.rewards.length > 0 ? (
                    <ul>
                      {card.rewards.map((reward, idx) => {
                        const category = REWARD_CATEGORIES.find(c => c.id === reward.categoryId);
                        return (
                          <li key={idx}>
                            {category?.icon} {reward.rewardRate}% on {category?.name || reward.categoryId}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="no-rewards">No rewards configured</p>
                  )}
                  {card.note && (
                    <p className="card-note">💡 {card.note}</p>
                  )}
                </div>
                
                <div className="card-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEditCard(card)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteCard(card.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            )})
          )}
        </div>
      )}

      {/* Add/Edit Card Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="credit-card-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCard ? 'Edit Credit Card' : 'Add Credit Card'}</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Bank Selection - only show when adding new card */}
              {!editingCard && (
                <div className="form-group">
                  <label>Select Bank</label>
                  <div className="bank-selector">
                    {BANKS.map(bank => (
                      <button
                        key={bank.id}
                        type="button"
                        className={`bank-option ${selectedBank === bank.id ? 'selected' : ''}`}
                        style={{ 
                          '--bank-color': bank.color,
                          borderColor: selectedBank === bank.id ? bank.color : 'transparent'
                        }}
                        onClick={() => handleBankSelect(bank.id)}
                      >
                        <span className="bank-logo">{bank.logo}</span>
                        <span className="bank-name">{bank.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Template Selection - only when bank is selected and adding new */}
              {!editingCard && selectedBank && CREDIT_CARD_DATABASE[selectedBank] && (
                <div className="form-group">
                  <label>Select Card</label>
                  <div className="card-template-selector">
                    {CREDIT_CARD_DATABASE[selectedBank].map(cardTemplate => (
                      <button
                        key={cardTemplate.id}
                        type="button"
                        className={`card-template-option ${selectedCardTemplate === cardTemplate.id ? 'selected' : ''}`}
                        onClick={() => handleCardTemplateSelect(cardTemplate.id)}
                      >
                        <div 
                          className="template-card-preview"
                          style={{ backgroundColor: cardTemplate.color }}
                        >
                          <span className="template-card-name">{cardTemplate.name}</span>
                        </div>
                        {cardTemplate.rewards.length > 0 && (
                          <div className="template-rewards-preview">
                            {cardTemplate.rewards.slice(0, 2).map((r, i) => {
                              const cat = REWARD_CATEGORIES.find(c => c.id === r.categoryId);
                              return (
                                <span key={i} className="template-reward-badge">
                                  {r.rewardRate}% {cat?.name || r.categoryId}
                                </span>
                              );
                            })}
                            {cardTemplate.rewards.length > 2 && (
                              <span className="template-reward-more">+{cardTemplate.rewards.length - 2} more</span>
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Show rest of form only when card is selected or editing */}
              {(selectedCardTemplate || editingCard || selectedBank === 'other') && (
                <>
                  <div className="form-group">
                    <label>Card Name *</label>
                    <input
                      type="text"
                      value={cardForm.name}
                      onChange={(e) => setCardForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Chase Freedom Flex"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Last 4 Digits (optional)</label>
                    <input
                      type="text"
                      value={cardForm.lastFourDigits}
                      onChange={(e) => setCardForm(prev => ({ 
                        ...prev, 
                        lastFourDigits: e.target.value.replace(/\D/g, '').slice(0, 4) 
                      }))}
                      placeholder="1234"
                      maxLength={4}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Card Color</label>
                    <div className="color-picker">
                      {CARD_COLORS.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          className={`color-option ${cardForm.color === c.color ? 'selected' : ''}`}
                              style={{ backgroundColor: c.color }}
                          onClick={() => setCardForm(prev => ({ ...prev, color: c.color }))}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="form-group rewards-section">
                    <label>
                      Reward Categories
                      <button 
                        type="button" 
                        className="add-reward-btn"
                        onClick={handleAddReward}
                      >
                        + Add Reward
                      </button>
                    </label>
                    
                    {cardForm.rewards.length === 0 ? (
                      <p className="no-rewards-hint">Click "Add Reward" to configure cashback/rewards for this card</p>
                    ) : (
                      <div className="rewards-list">
                        {cardForm.rewards.map((reward, index) => (
                          <div key={index} className="reward-row">
                            <select
                              value={reward.categoryId}
                              onChange={(e) => handleRewardChange(index, 'categoryId', e.target.value)}
                            >
                              {REWARD_CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.icon} {cat.name}
                                </option>
                              ))}
                            </select>
                            <div className="reward-rate-input">
                              <input
                                type="number"
                                value={reward.rewardRate}
                                onChange={(e) => handleRewardChange(index, 'rewardRate', e.target.value)}
                                placeholder="0"
                                min="0"
                                max="25"
                                step="0.5"
                              />
                              <span className="percent-sign">%</span>
                            </div>
                            <button 
                              type="button"
                              className="remove-reward-btn"
                              onClick={() => handleRemoveReward(index)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {cardForm.note && (
                    <div className="form-group">
                      <label>Card Note</label>
                      <p className="card-note-preview">💡 {cardForm.note}</p>
                    </div>
                  )}
                  
                  <div className="modal-actions">
                    <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="save-btn">
                      {editingCard ? 'Save Changes' : 'Add Card'}
                    </button>
                  </div>
                </>
              )}

              {/* Prompt to select bank first */}
              {!editingCard && !selectedBank && (
                <div className="select-bank-prompt">
                  <p>👆 Select a bank above to get started</p>
                </div>
              )}

              {/* Prompt to select card after bank is selected */}
              {!editingCard && selectedBank && !selectedCardTemplate && selectedBank !== 'other' && (
                <div className="select-card-prompt">
                  <p>👆 Select a card above, or choose "Other" bank for custom entry</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreditCards;

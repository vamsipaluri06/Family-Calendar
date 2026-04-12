import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, set, push, update, remove } from 'firebase/database';

const FamilyContext = createContext();

// Default family members with their colors
const DEFAULT_FAMILY_MEMBERS = [
  { id: 'member1', name: 'Parent 1', color: '#4285f4' },  // Google Blue
  { id: 'member2', name: 'Parent 2', color: '#ea4335' },  // Google Red
  { id: 'member3', name: 'Child', color: '#34a853' },     // Google Green
];

// Meal types for the day
const MEAL_TYPES = [
  { id: 'breakfast', name: 'Breakfast', icon: '🌅', time: '08:30' },
  { id: 'lunch', name: 'Lunch', icon: '🌤️', time: '13:20' },
  { id: 'snack', name: 'Snack', icon: '🍪', time: '17:30' },
  { id: 'dinner', name: 'Dinner', icon: '🌙', time: '20:00' },
];

// Credit card reward categories
const REWARD_CATEGORIES = [
  { id: 'groceries', name: 'Groceries', icon: '🛒', stores: ['costco', 'winco', 'kroger', 'wholefoods', 'walmart', 'target'] },
  { id: 'online', name: 'Online Shopping', icon: '💻', stores: ['amazon'] },
  { id: 'wholesale', name: 'Wholesale Clubs', icon: '📦', stores: ['costco'] },
  { id: 'dining', name: 'Dining', icon: '🍽️', stores: [] },
  { id: 'gas', name: 'Gas Stations', icon: '⛽', stores: [] },
  { id: 'travel', name: 'Travel', icon: '✈️', stores: [] },
  { id: 'drugstore', name: 'Drugstores', icon: '💊', stores: [] },
  { id: 'streaming', name: 'Streaming Services', icon: '📺', stores: [] },
  { id: 'all', name: 'All Purchases', icon: '💳', stores: ['amazon', 'costco', 'winco', 'indian', 'walmart', 'target', 'kroger', 'wholefoods', 'misc'] },
];

// Store to category mappings
const STORE_CATEGORIES = {
  amazon: ['online', 'all'],
  costco: ['groceries', 'wholesale', 'all'],
  winco: ['groceries', 'all'],
  indian: ['groceries', 'all'],
  walmart: ['groceries', 'all'],
  target: ['groceries', 'all'],
  kroger: ['groceries', 'all'],
  wholefoods: ['groceries', 'all'],
  misc: ['all'],
};

// Store payment restrictions
// acceptedNetworks: which card networks are accepted (visa, mastercard, amex, discover)
// noCreditCards: true if store doesn't accept credit cards (cash/debit only)
const STORE_PAYMENT_RULES = {
  costco: { 
    acceptedNetworks: ['visa'], 
    note: 'Only Visa cards accepted' 
  },
  winco: { 
    noCreditCards: true, 
    note: 'Cash or Debit only - No credit cards' 
  },
};

// Map banks to their card networks
const BANK_CARD_NETWORKS = {
  chase: 'visa',
  citi: 'visa',      // Most Citi cards are Visa or Mastercard
  boa: 'visa',       // Most BOA cards are Visa
  amex: 'amex',
  discover: 'discover',
  other: 'unknown',
};

export function FamilyProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [meals, setMeals] = useState({});
  const [groceryItems, setGroceryItems] = useState([]);
  const [storeExpenses, setStoreExpenses] = useState([]);
  const [familyMembers, setFamilyMembers] = useState(DEFAULT_FAMILY_MEMBERS);
  const [creditCards, setCreditCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Load data from Firebase or localStorage
  useEffect(() => {
    if (db) {
      setIsFirebaseConnected(true);
      
      // Listen to events
      const eventsRef = ref(db, 'events');
      const unsubEvents = onValue(eventsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const eventsArray = Object.entries(data).map(([id, event]) => ({
            ...event,
            id
          }));
          setEvents(eventsArray);
        } else {
          setEvents([]);
        }
      });

      // Listen to meals
      const mealsRef = ref(db, 'meals');
      const unsubMeals = onValue(mealsRef, (snapshot) => {
        const data = snapshot.val();
        setMeals(data || {});
      });

      // Listen to grocery items
      const groceryRef = ref(db, 'groceryItems');
      const unsubGrocery = onValue(groceryRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const itemsArray = Object.entries(data).map(([id, item]) => ({
            ...item,
            id
          }));
          setGroceryItems(itemsArray);
        } else {
          setGroceryItems([]);
        }
      });

      // Listen to family members
      const familyRef = ref(db, 'familyMembers');
      const unsubFamily = onValue(familyRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setFamilyMembers(data);
        }
        setLoading(false);
      });

      // Listen to store expenses
      const expensesRef = ref(db, 'storeExpenses');
      const unsubExpenses = onValue(expensesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const expensesArray = Object.entries(data).map(([id, expense]) => ({
            ...expense,
            id
          }));
          setStoreExpenses(expensesArray);
        } else {
          setStoreExpenses([]);
        }
      });

      // Listen to credit cards
      const creditCardsRef = ref(db, 'creditCards');
      const unsubCreditCards = onValue(creditCardsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const cardsArray = Object.entries(data).map(([id, card]) => ({
            ...card,
            id
          }));
          setCreditCards(cardsArray);
        } else {
          setCreditCards([]);
        }
      });

      return () => {
        unsubEvents();
        unsubMeals();
        unsubGrocery();
        unsubFamily();
        unsubExpenses();
        unsubCreditCards();
      };
    } else {
      // Fallback to localStorage
      const savedEvents = localStorage.getItem('familyCalendarEvents');
      const savedMeals = localStorage.getItem('familyCalendarMeals');
      const savedGrocery = localStorage.getItem('familyCalendarGrocery');
      const savedFamily = localStorage.getItem('familyCalendarMembers');
      const savedExpenses = localStorage.getItem('familyCalendarExpenses');
      const savedCreditCards = localStorage.getItem('familyCalendarCreditCards');
      
      if (savedEvents) setEvents(JSON.parse(savedEvents));
      if (savedMeals) setMeals(JSON.parse(savedMeals));
      if (savedGrocery) setGroceryItems(JSON.parse(savedGrocery));
      if (savedFamily) setFamilyMembers(JSON.parse(savedFamily));
      if (savedExpenses) setStoreExpenses(JSON.parse(savedExpenses));
      if (savedCreditCards) setCreditCards(JSON.parse(savedCreditCards));
      
      setLoading(false);
    }
  }, []);

  // Save to localStorage when Firebase is not connected
  useEffect(() => {
    if (!isFirebaseConnected && !loading) {
      localStorage.setItem('familyCalendarEvents', JSON.stringify(events));
      localStorage.setItem('familyCalendarMeals', JSON.stringify(meals));
      localStorage.setItem('familyCalendarGrocery', JSON.stringify(groceryItems));
      localStorage.setItem('familyCalendarMembers', JSON.stringify(familyMembers));
      localStorage.setItem('familyCalendarExpenses', JSON.stringify(storeExpenses));
      localStorage.setItem('familyCalendarCreditCards', JSON.stringify(creditCards));
    }
  }, [events, meals, groceryItems, familyMembers, storeExpenses, creditCards, isFirebaseConnected, loading]);

  // Helper function to generate recurring event dates
  const generateRecurringDates = (startDate, endDate, recurringType) => {
    const dates = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    
    // Add the first date
    dates.push(new Date(current));
    
    while (current < end) {
      switch (recurringType) {
        case 'daily':
          current.setDate(current.getDate() + 1);
          break;
        case 'weekly':
          current.setDate(current.getDate() + 7);
          break;
        case 'monthly':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'annually':
          current.setFullYear(current.getFullYear() + 1);
          break;
        default:
          return dates;
      }
      
      if (current <= end) {
        dates.push(new Date(current));
      }
    }
    
    return dates;
  };

  // Event functions
  const addEvent = async (event) => {
    const { recurring, recurringEndDate, ...eventBase } = event;
    
    // If not recurring or no end date, just add single event
    if (!recurring || recurring === 'none' || !recurringEndDate) {
      if (db) {
        const eventsRef = ref(db, 'events');
        await push(eventsRef, { ...event, recurring: 'none' });
      } else {
        const newEvent = { ...event, id: Date.now().toString(), recurring: 'none' };
        setEvents(prev => [...prev, newEvent]);
      }
      return;
    }
    
    // Generate recurring events
    const startDateStr = event.start.split('T')[0];
    const startTime = event.start.includes('T') ? event.start.split('T')[1] : null;
    const endDateStr = event.end ? event.end.split('T')[0] : startDateStr;
    const endTime = event.end && event.end.includes('T') ? event.end.split('T')[1] : null;
    
    // Calculate days difference between start and end
    const daysDiff = Math.round((new Date(endDateStr) - new Date(startDateStr)) / (1000 * 60 * 60 * 24));
    
    const recurringDates = generateRecurringDates(startDateStr, recurringEndDate, recurring);
    const recurringGroupId = Date.now().toString(); // Group ID to link recurring events
    
    for (const date of recurringDates) {
      const dateStr = date.toISOString().split('T')[0];
      
      // Calculate end date for this occurrence
      const endOccurrence = new Date(date);
      endOccurrence.setDate(endOccurrence.getDate() + daysDiff);
      const endDateOccurrence = endOccurrence.toISOString().split('T')[0];
      
      const newEventData = {
        ...eventBase,
        start: startTime ? `${dateStr}T${startTime}` : dateStr,
        end: endTime ? `${endDateOccurrence}T${endTime}` : endDateOccurrence,
        recurring: recurring,
        recurringGroupId: recurringGroupId,
        recurringEndDate: recurringEndDate
      };
      
      if (db) {
        const eventsRef = ref(db, 'events');
        await push(eventsRef, newEventData);
      } else {
        const newEvent = { ...newEventData, id: `${Date.now()}_${dateStr}` };
        setEvents(prev => [...prev, newEvent]);
      }
    }
  };

  const updateEvent = async (id, updatedEvent) => {
    if (db) {
      const eventRef = ref(db, `events/${id}`);
      await update(eventRef, updatedEvent);
    } else {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updatedEvent } : e));
    }
  };

  const deleteEvent = async (id, deleteAllRecurring = false) => {
    // Find the event to check if it's part of a recurring group
    const eventToDelete = events.find(e => e.id === id);
    
    if (deleteAllRecurring && eventToDelete?.recurringGroupId) {
      // Delete all events in the recurring group
      const groupId = eventToDelete.recurringGroupId;
      const eventsToDelete = events.filter(e => e.recurringGroupId === groupId);
      
      for (const event of eventsToDelete) {
        if (db) {
          const eventRef = ref(db, `events/${event.id}`);
          await remove(eventRef);
        }
      }
      
      if (!db) {
        setEvents(prev => prev.filter(e => e.recurringGroupId !== groupId));
      }
    } else {
      // Delete only this single event
      if (db) {
        const eventRef = ref(db, `events/${id}`);
        await remove(eventRef);
      } else {
        setEvents(prev => prev.filter(e => e.id !== id));
      }
    }
  };

  // Meal functions
  const setMeal = async (date, mealType, mealData) => {
    const key = `${date}_${mealType}`;
    if (db) {
      const mealRef = ref(db, `meals/${key}`);
      await set(mealRef, { ...mealData, date, mealType });
    } else {
      setMeals(prev => ({ ...prev, [key]: { ...mealData, date, mealType } }));
    }
  };

  const getMeal = (date, mealType) => {
    const key = `${date}_${mealType}`;
    return meals[key] || null;
  };

  const deleteMeal = async (date, mealType) => {
    const key = `${date}_${mealType}`;
    if (db) {
      const mealRef = ref(db, `meals/${key}`);
      await remove(mealRef);
    } else {
      setMeals(prev => {
        const newMeals = { ...prev };
        delete newMeals[key];
        return newMeals;
      });
    }
  };

  // Grocery functions
  const addGroceryItem = async (item) => {
    if (db) {
      const groceryRef = ref(db, 'groceryItems');
      await push(groceryRef, { ...item, checked: false, createdAt: Date.now() });
    } else {
      const newItem = { ...item, id: Date.now().toString(), checked: false, createdAt: Date.now() };
      setGroceryItems(prev => [...prev, newItem]);
    }
  };

  const toggleGroceryItem = async (id) => {
    const item = groceryItems.find(i => i.id === id);
    if (item) {
      if (db) {
        const itemRef = ref(db, `groceryItems/${id}`);
        await update(itemRef, { checked: !item.checked });
      } else {
        setGroceryItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
      }
    }
  };

  const removeGroceryItem = async (id) => {
    if (db) {
      const itemRef = ref(db, `groceryItems/${id}`);
      await remove(itemRef);
    } else {
      setGroceryItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const updateGroceryItem = async (id, updates) => {
    if (db) {
      const itemRef = ref(db, `groceryItems/${id}`);
      await update(itemRef, updates);
    } else {
      setGroceryItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    }
  };

  const generateGroceryFromMeals = async (startDate, endDate) => {
    // Get all meals in date range and extract ingredients
    const ingredients = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      for (const mealType of MEAL_TYPES) {
        const meal = getMeal(dateStr, mealType.id);
        if (meal && meal.ingredients) {
          meal.ingredients.forEach(ing => {
            if (!ingredients.find(i => i.name.toLowerCase() === ing.toLowerCase())) {
              ingredients.push({ name: ing, fromMeal: meal.name, date: dateStr });
            }
          });
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add unique ingredients to grocery list
    for (const ing of ingredients) {
      await addGroceryItem({ name: ing.name, fromMeal: ing.fromMeal });
    }

    return ingredients.length;
  };

  const clearCheckedGroceryItems = async () => {
    const checkedItems = groceryItems.filter(i => i.checked);
    for (const item of checkedItems) {
      await removeGroceryItem(item.id);
    }
  };

  // Family member functions
  const updateFamilyMember = async (memberId, updates) => {
    const updatedMembers = familyMembers.map(member => 
      member.id === memberId ? { ...member, ...updates } : member
    );
    
    if (db) {
      const familyRef = ref(db, 'familyMembers');
      await set(familyRef, updatedMembers);
    } else {
      setFamilyMembers(updatedMembers);
    }
  };

  const addFamilyMember = async (name, color) => {
    const newId = `member${Date.now()}`;
    const newMember = { id: newId, name, color };
    const updatedMembers = [...familyMembers, newMember];
    
    if (db) {
      const familyRef = ref(db, 'familyMembers');
      await set(familyRef, updatedMembers);
    } else {
      setFamilyMembers(updatedMembers);
    }
    
    return newId;
  };

  const removeFamilyMember = async (memberId) => {
    const updatedMembers = familyMembers.filter(member => member.id !== memberId);
    
    if (db) {
      const familyRef = ref(db, 'familyMembers');
      await set(familyRef, updatedMembers);
    } else {
      setFamilyMembers(updatedMembers);
    }
  };

  const updateAllFamilyMembers = async (newMembers) => {
    if (db) {
      const familyRef = ref(db, 'familyMembers');
      await set(familyRef, newMembers);
    } else {
      setFamilyMembers(newMembers);
    }
  };

  // Store expense functions
  const addStoreExpense = async (expense) => {
    // expense: { storeId, amount, date, note? }
    if (db) {
      const expensesRef = ref(db, 'storeExpenses');
      await push(expensesRef, { ...expense, createdAt: Date.now() });
    } else {
      const newExpense = { ...expense, id: Date.now().toString(), createdAt: Date.now() };
      setStoreExpenses(prev => [...prev, newExpense]);
    }
  };

  const updateStoreExpense = async (id, updates) => {
    if (db) {
      const expenseRef = ref(db, `storeExpenses/${id}`);
      await update(expenseRef, updates);
    } else {
      setStoreExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    }
  };

  const removeStoreExpense = async (id) => {
    if (db) {
      const expenseRef = ref(db, `storeExpenses/${id}`);
      await remove(expenseRef);
    } else {
      setStoreExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const getStoreExpenses = (storeId, year, month) => {
    return storeExpenses.filter(e => {
      if (e.storeId !== storeId) return false;
      const expenseDate = new Date(e.date);
      if (year && expenseDate.getFullYear() !== year) return false;
      if (month !== undefined && expenseDate.getMonth() !== month) return false;
      return true;
    });
  };

  const getMonthlyTotal = (storeId, year, month) => {
    const expenses = getStoreExpenses(storeId, year, month);
    return expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  };

  const getAnnualTotal = (storeId, year) => {
    const expenses = storeExpenses.filter(e => {
      if (e.storeId !== storeId) return false;
      const expenseDate = new Date(e.date);
      return expenseDate.getFullYear() === year;
    });
    return expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  };

  const getAllStoresAnnualTotal = (year) => {
    const expenses = storeExpenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getFullYear() === year;
    });
    return expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  };

  // Credit card functions
  const addCreditCard = async (card) => {
    // card: { name, lastFourDigits, color, rewards: [{ categoryId, rewardRate }] }
    if (db) {
      const cardsRef = ref(db, 'creditCards');
      await push(cardsRef, { ...card, createdAt: Date.now() });
    } else {
      const newCard = { ...card, id: Date.now().toString(), createdAt: Date.now() };
      setCreditCards(prev => [...prev, newCard]);
    }
  };

  const updateCreditCard = async (id, updates) => {
    if (db) {
      const cardRef = ref(db, `creditCards/${id}`);
      await update(cardRef, updates);
    } else {
      setCreditCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }
  };

  const removeCreditCard = async (id) => {
    if (db) {
      const cardRef = ref(db, `creditCards/${id}`);
      await remove(cardRef);
    } else {
      setCreditCards(prev => prev.filter(c => c.id !== id));
    }
  };

  // Check if a card is accepted at a store based on payment rules
  const isCardAcceptedAtStore = (card, storeId) => {
    const rules = STORE_PAYMENT_RULES[storeId];
    if (!rules) return true; // No restrictions
    
    // Store doesn't accept credit cards at all
    if (rules.noCreditCards) return false;
    
    // Check card network restrictions
    if (rules.acceptedNetworks) {
      const cardNetwork = BANK_CARD_NETWORKS[card.bank] || 'unknown';
      // If network is unknown, we can't determine - allow it with a warning
      if (cardNetwork === 'unknown') return true;
      return rules.acceptedNetworks.includes(cardNetwork);
    }
    
    return true;
  };

  // Get store payment rules/restrictions
  const getStorePaymentRules = (storeId) => {
    return STORE_PAYMENT_RULES[storeId] || null;
  };

  // Get best credit card for a store
  const getBestCardForStore = (storeId) => {
    if (!creditCards.length) return null;
    
    // Check if store accepts credit cards at all
    const rules = STORE_PAYMENT_RULES[storeId];
    if (rules?.noCreditCards) {
      return { noCreditCards: true, note: rules.note };
    }
    
    const storeCategories = STORE_CATEGORIES[storeId] || ['all'];
    let bestCard = null;
    let bestRate = 0;
    let matchedCategory = null;
    
    creditCards.forEach(card => {
      if (!card.rewards) return;
      
      // Check if this card is accepted at this store
      if (!isCardAcceptedAtStore(card, storeId)) return;
      
      card.rewards.forEach(reward => {
        // Check if this reward category applies to this store
        if (storeCategories.includes(reward.categoryId)) {
          const rate = parseFloat(reward.rewardRate) || 0;
          if (rate > bestRate) {
            bestRate = rate;
            bestCard = card;
            matchedCategory = REWARD_CATEGORIES.find(c => c.id === reward.categoryId);
          }
        }
      });
    });
    
    return bestCard ? { card: bestCard, rewardRate: bestRate, category: matchedCategory } : null;
  };

  // Get all card rewards for a store (sorted by reward rate)
  const getAllCardsForStore = (storeId) => {
    if (!creditCards.length) return [];
    
    // Check if store accepts credit cards at all
    const rules = STORE_PAYMENT_RULES[storeId];
    if (rules?.noCreditCards) return [];
    
    const storeCategories = STORE_CATEGORIES[storeId] || ['all'];
    const cardRewards = [];
    
    creditCards.forEach(card => {
      if (!card.rewards) return;
      
      // Check if this card is accepted at this store
      if (!isCardAcceptedAtStore(card, storeId)) return;
      
      let bestRewardForCard = 0;
      let bestCategoryForCard = null;
      
      card.rewards.forEach(reward => {
        if (storeCategories.includes(reward.categoryId)) {
          const rate = parseFloat(reward.rewardRate) || 0;
          if (rate > bestRewardForCard) {
            bestRewardForCard = rate;
            bestCategoryForCard = REWARD_CATEGORIES.find(c => c.id === reward.categoryId);
          }
        }
      });
      
      if (bestRewardForCard > 0) {
        cardRewards.push({
          card,
          rewardRate: bestRewardForCard,
          category: bestCategoryForCard
        });
      }
    });
    
    return cardRewards.sort((a, b) => b.rewardRate - a.rewardRate);
  };

  return (
    <FamilyContext.Provider value={{
      // Data
      events,
      meals,
      groceryItems,
      storeExpenses,
      creditCards,
      loading,
      isFirebaseConnected,
      
      // Constants
      FAMILY_MEMBERS: familyMembers,
      MEAL_TYPES,
      REWARD_CATEGORIES,
      STORE_CATEGORIES,
      
      // Event functions
      addEvent,
      updateEvent,
      deleteEvent,
      
      // Meal functions
      setMeal,
      getMeal,
      deleteMeal,
      
      // Grocery functions
      addGroceryItem,
      toggleGroceryItem,
      removeGroceryItem,
      updateGroceryItem,
      generateGroceryFromMeals,
      clearCheckedGroceryItems,

      // Store expense functions
      addStoreExpense,
      updateStoreExpense,
      removeStoreExpense,
      getStoreExpenses,
      getMonthlyTotal,
      getAnnualTotal,
      getAllStoresAnnualTotal,

      // Credit card functions
      addCreditCard,
      updateCreditCard,
      removeCreditCard,
      getBestCardForStore,
      getAllCardsForStore,
      getStorePaymentRules,

      // Family member functions
      updateFamilyMember,
      addFamilyMember,
      removeFamilyMember,
      updateAllFamilyMembers,
    }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}

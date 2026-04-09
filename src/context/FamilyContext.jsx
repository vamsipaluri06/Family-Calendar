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

export function FamilyProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [meals, setMeals] = useState({});
  const [groceryItems, setGroceryItems] = useState([]);
  const [familyMembers, setFamilyMembers] = useState(DEFAULT_FAMILY_MEMBERS);
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

      return () => {
        unsubEvents();
        unsubMeals();
        unsubGrocery();
        unsubFamily();
      };
    } else {
      // Fallback to localStorage
      const savedEvents = localStorage.getItem('familyCalendarEvents');
      const savedMeals = localStorage.getItem('familyCalendarMeals');
      const savedGrocery = localStorage.getItem('familyCalendarGrocery');
      const savedFamily = localStorage.getItem('familyCalendarMembers');
      
      if (savedEvents) setEvents(JSON.parse(savedEvents));
      if (savedMeals) setMeals(JSON.parse(savedMeals));
      if (savedGrocery) setGroceryItems(JSON.parse(savedGrocery));
      if (savedFamily) setFamilyMembers(JSON.parse(savedFamily));
      
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
    }
  }, [events, meals, groceryItems, familyMembers, isFirebaseConnected, loading]);

  // Event functions
  const addEvent = async (event) => {
    if (db) {
      const eventsRef = ref(db, 'events');
      await push(eventsRef, event);
    } else {
      const newEvent = { ...event, id: Date.now().toString() };
      setEvents(prev => [...prev, newEvent]);
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

  const deleteEvent = async (id) => {
    if (db) {
      const eventRef = ref(db, `events/${id}`);
      await remove(eventRef);
    } else {
      setEvents(prev => prev.filter(e => e.id !== id));
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
  const updateFamilyMember = async (memberId, newName) => {
    const updatedMembers = familyMembers.map(member => 
      member.id === memberId ? { ...member, name: newName } : member
    );
    
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

  return (
    <FamilyContext.Provider value={{
      // Data
      events,
      meals,
      groceryItems,
      loading,
      isFirebaseConnected,
      
      // Constants
      FAMILY_MEMBERS: familyMembers,
      MEAL_TYPES,
      
      // Event functions
      addEvent,
      updateEvent,
      deleteEvent,
      
      // Meal functions
      setMeal,
      getMeal,
      
      // Grocery functions
      addGroceryItem,
      toggleGroceryItem,
      removeGroceryItem,
      generateGroceryFromMeals,
      clearCheckedGroceryItems,

      // Family member functions
      updateFamilyMember,
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

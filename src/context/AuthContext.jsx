import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, set, update, remove } from 'firebase/database';

const AuthContext = createContext();

// Default admin credentials
const DEFAULT_ADMIN = {
  username: 'admin',
  password: '1Admin1@3',
  role: 'admin'
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({}); // Users with passwords
  const [adminCredentials, setAdminCredentials] = useState(DEFAULT_ADMIN);
  const [loading, setLoading] = useState(true);

  // Load users and admin credentials from Firebase or localStorage
  useEffect(() => {
    if (db) {
      // Listen to users
      const usersRef = ref(db, 'users');
      const unsubUsers = onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        setUsers(data || {});
      });

      // Listen to admin credentials
      const adminRef = ref(db, 'adminCredentials');
      const unsubAdmin = onValue(adminRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setAdminCredentials(data);
        }
        setLoading(false);
      });

      // Check for saved session
      const savedUser = localStorage.getItem('familyCalendarUser');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('familyCalendarUser');
        }
      }

      return () => {
        unsubUsers();
        unsubAdmin();
      };
    } else {
      // Load from localStorage
      const savedUsers = localStorage.getItem('familyCalendarUsers');
      const savedAdmin = localStorage.getItem('familyCalendarAdmin');
      const savedUser = localStorage.getItem('familyCalendarUser');

      if (savedUsers) setUsers(JSON.parse(savedUsers));
      if (savedAdmin) setAdminCredentials(JSON.parse(savedAdmin));
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('familyCalendarUser');
        }
      }
      setLoading(false);
    }
  }, []);

  // Save users to localStorage when Firebase is not connected
  useEffect(() => {
    if (!db && !loading) {
      localStorage.setItem('familyCalendarUsers', JSON.stringify(users));
      localStorage.setItem('familyCalendarAdmin', JSON.stringify(adminCredentials));
    }
  }, [users, adminCredentials, loading]);

  // Login for regular users
  const login = (user) => {
    const userWithRole = { ...user, role: 'user' };
    setCurrentUser(userWithRole);
    localStorage.setItem('familyCalendarUser', JSON.stringify(userWithRole));
  };

  // Login for admin
  const adminLogin = (username, password) => {
    if (username === adminCredentials.username && password === adminCredentials.password) {
      const admin = { ...adminCredentials, role: 'admin', name: 'Admin' };
      setCurrentUser(admin);
      localStorage.setItem('familyCalendarUser', JSON.stringify(admin));
      return true;
    }
    return false;
  };

  // Verify user password
  const verifyUserPassword = (memberId, password) => {
    const userRecord = users[memberId];
    if (!userRecord) return false;
    return userRecord.password === password;
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('familyCalendarUser');
  };

  // Admin functions - Set user password
  const setUserPassword = async (memberId, password, memberName) => {
    const userData = { password, memberName, memberId };
    if (db) {
      const userRef = ref(db, `users/${memberId}`);
      await set(userRef, userData);
    } else {
      setUsers(prev => ({ ...prev, [memberId]: userData }));
    }
  };

  // Admin functions - Remove user
  const removeUser = async (memberId) => {
    if (db) {
      const userRef = ref(db, `users/${memberId}`);
      await remove(userRef);
    } else {
      setUsers(prev => {
        const newUsers = { ...prev };
        delete newUsers[memberId];
        return newUsers;
      });
    }
  };

  // Admin functions - Update admin credentials
  const updateAdminCredentials = async (username, password) => {
    const newCreds = { username, password, role: 'admin' };
    if (db) {
      const adminRef = ref(db, 'adminCredentials');
      await set(adminRef, newCreds);
    } else {
      setAdminCredentials(newCreds);
    }
    // Update current user if admin is logged in
    if (currentUser?.role === 'admin') {
      const admin = { ...newCreds, name: 'Admin' };
      setCurrentUser(admin);
      localStorage.setItem('familyCalendarUser', JSON.stringify(admin));
    }
  };

  const value = {
    currentUser,
    users,
    adminCredentials,
    login,
    adminLogin,
    verifyUserPassword,
    logout,
    setUserPassword,
    removeUser,
    updateAdminCredentials,
    isLoggedIn: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

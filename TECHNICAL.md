# 🔧 Technical Documentation

## Family Calendar - Technical Architecture

This document provides detailed technical information about the Family Calendar application for developers and maintainers.

---

## 📦 Technology Stack

### Frontend Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI component library |
| **Vite** | 5.0.0 | Build tool & dev server |
| **JavaScript (ES6+)** | - | Primary language |
| **CSS3** | - | Styling with modern features |

### Key Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| **FullCalendar** | 6.1.x | Calendar component (React wrapper) |
| **Firebase** | 10.x | Real-time database & hosting |
| **React Context API** | - | Global state management |

### Development Tools
| Tool | Purpose |
|------|---------|
| **npm** | Package management |
| **gh-pages** | GitHub Pages deployment |
| **ESLint** | Code linting (via Vite) |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      index.html                              │
│                    (Entry Point)                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       main.jsx                               │
│              (React Root + Providers)                        │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  <AuthProvider>                                      │   │
│   │    <FamilyProvider>                                  │   │
│   │      <App />                                         │   │
│   │    </FamilyProvider>                                 │   │
│   │  </AuthProvider>                                     │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        App.jsx                               │
│                   (Main Application)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  Header  │ │ Sidebar  │ │  Main    │ │ Mobile Nav   │   │
│  │ (Clock)  │ │ (Nav)    │ │ Content  │ │ (Bottom Bar) │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 File Structure Explained

### `/src/context/` - State Management

#### `AuthContext.jsx`
Manages user authentication state using React Context.

```javascript
// Key exports
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// State
{
  currentUser: { id, name, color } | null,
  isLoggedIn: boolean,
  loading: boolean
}

// Methods
login(user)    // Set current user, save to localStorage
logout()       // Clear user, remove from localStorage
```

**Features:**
- Persists login state in `localStorage`
- Provides `useAuth()` hook for components
- Auto-restores session on page reload

#### `FamilyContext.jsx`
Manages all application data with Firebase sync.

```javascript
// Key exports
export const useFamily = () => useContext(FamilyContext);

// State
{
  events: [],           // Calendar events
  meals: {},            // Meals by date/type
  groceryItems: [],     // Shopping list
  FAMILY_MEMBERS: [],   // Member definitions
  MEAL_TYPES: [],       // Breakfast, Lunch, etc.
  loading: boolean,
  isFirebaseConnected: boolean
}

// Methods
addEvent(event)         // Add calendar event
updateEvent(id, data)   // Modify event
deleteEvent(id)         // Remove event
getMeal(date, type)     // Get meal for date/type
setMeal(date, type, meal) // Save meal
deleteMeal(date, type)  // Remove meal
// ... grocery methods
```

**Data Flow:**
1. Component calls `useFamily()` to access state
2. Mutation methods update local state immediately
3. If Firebase connected, sync to cloud
4. Firebase listeners update state on remote changes

---

### `/src/components/` - UI Components

#### `LoginPage.jsx`
PIN-based authentication screen.

```javascript
// PIN Configuration
const memberPins = {
  'member1': '6565',
  'member2': '6565',
  'member3': '6565'
};

// Flow
1. Display family member grid
2. User selects member → Show PIN input
3. Validate PIN → Call login(member)
4. Redirect to main app
```

#### `Calendar.jsx`
Main calendar view with FullCalendar integration.

```javascript
// Key Features
- FullCalendar with dayGrid, timeGrid plugins
- Custom day cell rendering (meal icons)
- Meal popup on food bowl click
- Per-user voting system
- Date summary panel

// Voting Logic
handleVote(mealType, voteType) {
  const meal = getMeal(date, mealType);
  const userId = currentUser.id;
  
  if (userAlreadyVoted) return;
  
  if (voteType === 'like') {
    meal.likedBy.push(userId);
  } else {
    meal.dislikedBy.push(userId);
  }
  
  setMeal(date, mealType, meal);
}
```

#### `MealPlanner.jsx`
Week and day view meal planning.

```javascript
// Views
- Week View: 7-day grid with meal rows
- Day View: Single day with meal cards

// Date Handling
formatDateLocal(date) {
  // Prevents timezone issues
  return `${year}-${month.padStart(2)}-${day.padStart(2)}`;
}
```

#### `MealModal.jsx`
Meal creation/editing form.

```javascript
// Form Fields
- name (required)
- description
- ingredients[] (chip-style input)
- recipe
- prepTime, cookTime
- servings
- notes
- likedBy[], dislikedBy[] (voting)

// Auto-save updates voting to Firebase
```

---

## 🎨 Styling Architecture

### CSS Organization

```
index.css          # Global styles, variables, mobile responsive
App.css            # Component-specific styles
```

### CSS Custom Properties (Variables)

```css
:root {
  /* Colors */
  --primary: #4285f4;
  --primary-dark: #1a73e8;
  --danger: #ea4335;
  --success: #34a853;
  
  /* Theme */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #202124;
  --text-secondary: #5f6368;
  
  /* Layout */
  --sidebar-width: 256px;
  --header-height: 64px;  /* 56px on tablet, 52px on mobile */
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(60, 64, 67, 0.1);
  --shadow-md: 0 2px 6px rgba(60, 64, 67, 0.15);
}
```

### Rainbow Theme Implementation

```css
/* Animated gradient background */
body {
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.15) 0%, 
    rgba(118, 75, 162, 0.1) 25%,
    rgba(240, 147, 251, 0.1) 50%,
    rgba(102, 126, 234, 0.1) 75%,
    rgba(118, 75, 162, 0.15) 100%
  );
  background-size: 400% 400%;
  animation: rainbowShift 20s ease infinite;
}

/* Glassmorphism cards */
.calendar-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
}

/* Gradient header */
.header {
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.95) 0%, 
    rgba(118, 75, 162, 0.95) 50%,
    rgba(240, 147, 251, 0.9) 100%
  );
  animation: headerGradient 8s ease infinite;
}
```

### Mobile Responsive Breakpoints

```css
/* Tablet (768px) */
@media (max-width: 768px) {
  --header-height: 56px;
  /* Sidebar becomes slide-out drawer */
  /* Bottom navigation appears */
}

/* Mobile (480px) */
@media (max-width: 480px) {
  --header-height: 52px;
  /* Compact calendar */
  /* Full-width modals */
}

/* Small phones (360px) */
@media (max-width: 360px) {
  /* Extra compact mode */
}
```

---

## 🔥 Firebase Integration

### Database Structure

```
firebase-realtime-db/
├── events/
│   └── {eventId}/
│       ├── id: string
│       ├── title: string
│       ├── start: string (ISO date)
│       ├── end: string (ISO date)
│       ├── memberIds: string[]
│       └── description: string
│
├── meals/
│   └── {date}/              # "2026-04-09"
│       └── {mealType}/      # "breakfast", "lunch", etc.
│           ├── name: string
│           ├── description: string
│           ├── ingredients: string[]
│           ├── likedBy: string[]
│           └── dislikedBy: string[]
│
└── groceryItems/
    └── {itemId}/
        ├── id: string
        ├── name: string
        ├── quantity: string
        ├── category: string
        └── checked: boolean
```

### Real-time Sync Logic

```javascript
// firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, remove } from 'firebase/database';

// FamilyContext.jsx
useEffect(() => {
  const eventsRef = ref(db, 'events');
  
  // Subscribe to changes
  const unsubscribe = onValue(eventsRef, (snapshot) => {
    const data = snapshot.val();
    setEvents(data ? Object.values(data) : []);
  });
  
  return () => unsubscribe();
}, []);

// Write data
const addEvent = async (event) => {
  await set(ref(db, `events/${event.id}`), event);
};
```

### Offline Fallback

```javascript
// If Firebase not configured, use localStorage
const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY;

if (!isFirebaseConfigured) {
  // Load from localStorage
  const saved = localStorage.getItem('familyCalendarData');
  // ... hydrate state
  
  // Save on changes
  useEffect(() => {
    localStorage.setItem('familyCalendarData', JSON.stringify(state));
  }, [state]);
}
```

---

## 📱 Mobile-First Features

### Bottom Navigation Bar

```jsx
<nav className="mobile-bottom-nav">
  <button className="mobile-nav-btn">📅 Calendar</button>
  <button className="mobile-nav-btn">🍽️ Meals</button>
  <button className="mobile-nav-btn add-btn">➕</button>
  <button className="mobile-nav-btn">🛒 Grocery</button>
  <button className="mobile-nav-btn">⚙️ Settings</button>
</nav>
```

### Touch Optimizations

```css
/* Disable tap highlight */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Prevent zoom on input focus (iOS) */
input, select, textarea {
  font-size: 16px;
}

/* Touch-friendly targets */
@media (hover: none) and (pointer: coarse) {
  .btn, .nav-item {
    min-height: 44px;
  }
}
```

### Safe Area (Notched Phones)

```css
.mobile-bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .main-content {
    padding-bottom: calc(80px + env(safe-area-inset-bottom));
  }
}
```

### PWA Meta Tags

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<meta name="theme-color" content="#667eea" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

---

## 🧪 Development Guide

### Local Development

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create `.env` file:

```env
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://xxx.firebaseio.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

### Deployment (GitHub Pages)

```bash
# Build and deploy
npm run build
npm run deploy

# Configure in package.json
{
  "homepage": "https://username.github.io/Family-Calendar",
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}
```

### Vite Configuration

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  base: '/Family-Calendar/',  // For GitHub Pages subdirectory
  server: {
    port: 3000
  }
});
```

---

## 🔐 Security Considerations

### Current Implementation (Demo)
- PINs stored in client-side code (not secure for production)
- Firebase rules allow public read/write (testing mode)

### Production Recommendations
1. **Firebase Authentication** - Use Firebase Auth instead of PINs
2. **Database Rules** - Restrict access by user:
   ```json
   {
     "rules": {
       "events": {
         ".read": "auth != null",
         ".write": "auth != null"
       }
     }
   }
   ```
3. **Environment Variables** - Never commit `.env` file
4. **HTTPS** - Always serve over HTTPS

---

## 📊 Performance Optimizations

### Implemented
- **Code Splitting** - Vite handles automatic chunking
- **CSS Animations** - Hardware-accelerated transforms
- **Lazy Loading** - Modals rendered only when needed
- **Debounced Writes** - Firebase writes batched

### Recommendations for Scale
- Add React.memo() to expensive components
- Virtualize long lists (react-window)
- Add service worker for offline support
- Implement image lazy loading for meal photos

---

## 🐛 Known Issues & Limitations

1. **Timezone Handling** - Uses `T12:00:00` suffix to avoid date shift
2. **No Recurring Events** - Events are one-time only
3. **Single Family** - No multi-family support
4. **Basic Auth** - PIN-only, no password recovery

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [FullCalendar React](https://fullcalendar.io/docs/react)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [CSS Glassmorphism](https://css.glass/)

---

*Last Updated: April 2026*

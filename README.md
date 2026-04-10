# 👨‍👩‍👧 Family Calendar

A beautiful, feature-rich family calendar application with meal planning, grocery lists, and member authentication. Built with React and designed with a stunning rainbow gradient theme.

## ✨ Features

### Core Features
- 📅 **Calendar Views** - Day, Week, Month views powered by FullCalendar
- 🍽️ **Meal Planner** - Plan Breakfast, Lunch, Snack & Dinner for each day
- 🛒 **Grocery List** - Auto-generate shopping lists from meal ingredients
- 👪 **Family Members** - Color-coded events and activities for 3 family members
- 🔄 **Sync Across Devices** - Real-time sync with Firebase Realtime Database
- 📱 **Mobile-First Design** - Fully responsive with bottom navigation for phones

### Authentication & Personalization
- 🔐 **User Login** - PIN-based authentication for each family member
- 👤 **Personal Profiles** - Each member has their own avatar and color
- 👍👎 **Meal Voting** - Like/dislike meals with per-user tracking
- 🚪 **Logout** - Easy sign-out from the header

### Visual Design
- 🌈 **Rainbow Theme** - Animated gradient backgrounds throughout the app
- ✨ **Glassmorphism** - Frosted glass effects on cards and containers
- 🎨 **Beautiful Animations** - Smooth transitions and hover effects
- ⏰ **Live Clock** - Real-time clock and date display in the header

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 3. Login
- Select your family member profile
- Enter PIN: **6565** (default for all members)

## 🔥 Enable Cloud Sync (Optional)

To sync data across devices:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (it's free!)
3. Enable **Realtime Database** (Build → Realtime Database → Create Database)
4. Set database rules to allow read/write for testing:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
5. Go to Project Settings → Your Apps → Add Web App
6. Copy the config values
7. Create a `.env` file in the project root:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```
8. Restart the dev server

**Without Firebase**, the app uses localStorage (single device only).

## 📁 Project Structure

```
Family-Calendar/
├── src/
│   ├── components/
│   │   ├── Calendar.jsx       # Main calendar with meal popup & voting
│   │   ├── MealPlanner.jsx    # Week/day meal planning views
│   │   ├── GroceryList.jsx    # Shopping list management
│   │   ├── EventModal.jsx     # Add/edit calendar events
│   │   ├── MealModal.jsx      # Add/edit meals with voting
│   │   ├── SettingsModal.jsx  # Family member settings
│   │   └── LoginPage.jsx      # User authentication screen
│   ├── context/
│   │   ├── FamilyContext.jsx  # Global state (events, meals, members)
│   │   └── AuthContext.jsx    # Authentication state management
│   ├── App.jsx                # Main app with routing & layout
│   ├── App.css                # Component-specific styles
│   ├── index.css              # Global styles & mobile responsive
│   ├── main.jsx               # React entry point
│   └── firebase.js            # Firebase configuration
├── public/
│   └── calendar.svg           # App icon
├── index.html                 # HTML template with PWA meta tags
├── package.json               # Dependencies & scripts
├── vite.config.js             # Vite bundler configuration
├── README.md                  # This file
├── TECHNICAL.md               # Detailed technical documentation
└── .env.example               # Environment variables template
```

## 📱 Mobile Features

The app is designed mobile-first with:
- **Bottom Navigation Bar** - Quick access to Calendar, Meals, Add, Grocery, Settings
- **Floating Add Button** - Prominent center button for creating events
- **Slide-up Modals** - Sheet-style modals optimized for touch
- **Touch-friendly** - 44px minimum tap targets
- **Safe Area Support** - Works on notched phones (iPhone X+)
- **PWA Ready** - Can be added to home screen

## 🎨 Customization

### Change Family Members
Edit `src/context/FamilyContext.jsx`:

```javascript
const FAMILY_MEMBERS = [
  { id: 'member1', name: 'Dad', color: '#4285f4' },
  { id: 'member2', name: 'Mom', color: '#ea4335' },
  { id: 'member3', name: 'Alex', color: '#34a853' },
];
```

### Add More Meal Types
```javascript
const MEAL_TYPES = [
  { id: 'breakfast', name: 'Breakfast', icon: '🌅', time: '08:00' },
  { id: 'lunch', name: 'Lunch', icon: '🌤️', time: '12:00' },
  { id: 'snack', name: 'Snack', icon: '🍪', time: '15:00' },
  { id: 'dinner', name: 'Dinner', icon: '🌙', time: '19:00' },
  // Add more here
];
```

## 🌐 Deploy for Free

### GitHub Pages (Current Deployment)
```bash
npm run build
npm run deploy
```
Live at: `https://yourusername.github.io/Family-Calendar/`

### Vercel (Alternative)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repo
4. Add environment variables if using Firebase
5. Deploy!

## 🔧 Configuration

### Change Default PIN
Edit `src/components/LoginPage.jsx`:
```javascript
const memberPins = {
  'member1': '6565',  // Change these
  'member2': '6565',
  'member3': '6565'
};
```

### Change Family Members
Edit `src/context/FamilyContext.jsx`:
```javascript
const FAMILY_MEMBERS = [
  { id: 'member1', name: 'Dad', color: '#4285f4' },
  { id: 'member2', name: 'Mom', color: '#ea4335' },
  { id: 'member3', name: 'Alex', color: '#34a853' },
];
```

## 📚 Documentation

- **[README.md](README.md)** - This file (quick start & features)
- **[TECHNICAL.md](TECHNICAL.md)** - Detailed technical architecture & implementation

## 📝 License

Free for personal use. Built with ❤️ for families.

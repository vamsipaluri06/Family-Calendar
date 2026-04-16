# 👨‍👩‍👧 Family Calendar

A beautiful, feature-rich family calendar application with meal planning, grocery lists, expense tracking, and member authentication. Built with React and designed with a stunning rainbow gradient theme.

**Current Version: 2.4.0** | [View Changelog](#-changelog)

## ✨ Features

### Core Features
- 📅 **Calendar Views** - Day, Week, Month views powered by FullCalendar
- ⬅️➡️ **Inline Navigation** - Clean "< April >" style month navigation (v2.3.0)
- ✅ **Event Completion** - Mark events as done with checkbox & strikethrough
- 🍽️ **Meal Planner** - Plan Breakfast, Lunch, Snack & Dinner for each day
- 🛒 **Grocery List** - Auto-generate shopping lists from meal ingredients
- 👪 **Family Members** - Color-coded events and activities for 3 family members
- 🔄 **Sync Across Devices** - Real-time sync with Firebase Realtime Database
- 📱 **Mobile-First Design** - Fully responsive with bottom navigation for phones
- 🌙 **Dark Theme** - Toggle between light and dark mode

### 📱 PWA Support (New in v2.1.0)
- 📲 **Install as App** - Add to home screen on iPhone, Android, or desktop
- 🔄 **Offline Caching** - Works offline with service worker
- 🎨 **Custom App Icon** - Beautiful icon on your home screen
- ⚡ **Fast Loading** - Cached assets for instant startup

### 💰 Finance & Expense Tracking
- 💳 **Credit Cards** - Track rewards and payment due dates
- 🏠 **Monthly Utilities** - Track Rent, Electricity, Internet, Mobile bills
- 💵 **Expense Tracking** - Log expenses by store with full history
- 🍴 **Restaurant Expenses** - Separate tab for tracking dining out (v2.4.0)
- 📊 **Expense Pie Chart** - Visual donut chart with store breakdown (v2.3.0)
- ✨ **Lazy Load Chart** - Smooth animated entrance with spinning skeleton (v2.4.0)
- 📈 **Monthly Details** - Click month total to see all expenses
- 📉 **Yearly Breakdown** - Click year total to see monthly totals

### Authentication & Security
- 🔐 **User Login** - PIN-based authentication for each family member
- 🔒 **Password Hashing** - SHA-256 encrypted passwords (v2.0.0+)
- 👤 **Personal Profiles** - Each member has their own avatar and color
- 👍👎 **Meal Voting** - Like/dislike meals with per-user tracking
- 🚪 **Logout** - Easy sign-out from the header

### Visual Design
- 🌈 **Rainbow Theme** - Animated gradient backgrounds throughout the app
- ✨ **Glassmorphism** - Frosted glass effects on cards and containers
- 🎨 **Beautiful Animations** - Smooth transitions and hover effects
- 🎯 **Bounce Effects** - Playful tap feedback on mobile navigation (v2.4.0)
- 📱 **Staggered Animations** - Cards cascade in smoothly on page load (v2.4.0)
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
│   │   ├── Calendar.jsx         # Main calendar with meal popup & voting
│   │   ├── MealPlanner.jsx      # Week/day meal planning views
│   │   ├── GroceryList.jsx      # Shopping list management
│   │   ├── CreditCards.jsx      # Credit card rewards tracker
│   │   ├── MonthlyUtilities.jsx # Monthly bills tracking
│   │   ├── ExpenseSummary.jsx   # Expense history by store
│   │   ├── EventModal.jsx       # Add/edit calendar events
│   │   ├── MealModal.jsx        # Add/edit meals with voting
│   │   ├── ExpenseModal.jsx     # Add/edit expenses
│   │   ├── UtilityModal.jsx     # Add/edit utility bills
│   │   ├── SettingsModal.jsx    # Family member settings
│   │   ├── AdminDashboard.jsx   # Admin management panel
│   │   ├── TimePicker.jsx       # Time selection component
│   │   └── LoginPage.jsx        # User authentication & PWA install
│   ├── context/
│   │   ├── FamilyContext.jsx    # Global state (events, meals, expenses, utilities)
│   │   └── AuthContext.jsx      # Authentication with password hashing
│   ├── App.jsx                  # Main app with routing & layout
│   ├── App.css                  # Component-specific styles
│   ├── index.css                # Global styles & mobile responsive
│   ├── main.jsx                 # React entry point
│   ├── version.js               # Version info & changelog
│   └── firebase.js              # Firebase configuration
├── public/
│   ├── Logos/                   # App logos
│   ├── pwa-192x192.png          # PWA icon (192x192)
│   ├── pwa-512x512.png          # PWA icon (512x512)
│   └── apple-touch-icon.png     # iOS home screen icon
├── index.html                   # HTML template with PWA meta tags
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
- **PWA Install Button** - Easy one-tap install from login screen
- **Offline Support** - Works without internet after first load

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

## 📝 Changelog

### v2.4.0 (April 16, 2026)
- 🍴 **Restaurant Expenses** - New tab in Grocery section for tracking dining out
- 🎯 **Bounce Animations** - Playful tap feedback on mobile bottom navigation
- 📱 **Staggered Card Animations** - Store cards cascade in when opening Grocery tab
- 🍽️ **Meal Card Animations** - Breakfast, Lunch, Snack, Dinner slide in smoothly
- 💰 **Expense Tab Animations** - Header, cards, and chart animate in sequence
- ✨ **Lazy Load Pie Chart** - 2.5s delay with colorful spinning skeleton loader
- 🌈 **Conic Gradient Loader** - Multi-color spinning rings during chart load
- 🎨 **Pop-in Chart Animation** - Bouncy entrance when pie chart appears

### v2.3.0 (April 15, 2026)
- 📊 **Expense Pie Chart** - Visual donut chart showing spending breakdown by store
- 📅 **Calendar Navigation** - Inline "< April >" style with arrows side by side
- 🎯 **Today Button** - Centered below month navigation for quick access
- 🎨 **Chart Legend** - Store names with color indicators below pie chart
- 📱 **Mobile Calendar** - Improved horizontal toolbar layout

### v2.2.0 (April 14, 2026)
- 🌙 Dark Theme - Toggle between light and dark mode
- ✅ Event Completion - Mark events done with checkbox & strikethrough
- 📊 Monthly Expense Details - Click month total to view all expenses
- 📈 Yearly Expense Breakdown - Click year total to see monthly totals
- 📱 Improved mobile navigation - Sidebar closes on nav tap
- 🎨 Dark theme support for calendar, meals, and all screens
### v2.1.0 (April 14, 2026)
- 📱 PWA Support - Install as app on iPhone/Android/Desktop
- 🔄 Offline caching with service worker
- 🎨 Custom app icon for home screen
- 📲 Install button on login screen with manual instructions

### v2.0.0 (April 14, 2026)
- 🔒 Added password hashing for security (SHA-256)
- 🏠 Added Monthly Utilities tracking (Rent, Electricity, Internet, Mobile)
- 🐛 Fixed timezone bug for utility date handling
- 📱 Improved mobile navigation

### v1.5.0 (April 13, 2026)
- 💳 Added Credit Cards rewards tracker
- 💰 Added Expense tracking by store
- 🛒 Added Grocery List with store selection

### v1.0.0 (April 1, 2026)
- 📅 Initial release
- 👨‍👩‍👧 Family member management
- 🍽️ Meal planning feature
- 📱 Mobile-responsive design
- 🔥 Firebase real-time sync

## �📝 License

Free for personal use. Built with ❤️ for families.
## 🎨 Icon Attribution

- Restaurant icon by [Gan Khoon Lay](https://thenounproject.com/creator/leremy/) from [The Noun Project](https://thenounproject.com/icon/restaurant-642040/)
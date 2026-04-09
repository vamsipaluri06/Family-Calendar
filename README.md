# 👨‍👩‍👧 Family Calendar

A beautiful, Google Calendar-inspired family calendar with meal planning and grocery list generation.

## ✨ Features

- 📅 **Calendar Views** - Day, Week, Month views (like Google Calendar)
- 🍽️ **Meal Planner** - Plan Breakfast, Lunch, Snack & Dinner for each day
- 🛒 **Grocery List** - Auto-generate from meal ingredients
- 👪 **Family Members** - Color-coded events for 3 family members
- 🔄 **Sync Across Devices** - Optional Firebase integration
- 📱 **Responsive** - Works on desktop and mobile

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
Family calender/
├── src/
│   ├── components/
│   │   ├── Calendar.jsx      # Main calendar view
│   │   ├── MealPlanner.jsx   # Meal planning grid
│   │   ├── GroceryList.jsx   # Shopping list
│   │   ├── EventModal.jsx    # Add/edit events
│   │   └── MealModal.jsx     # Add/edit meals
│   ├── context/
│   │   └── FamilyContext.jsx # State management
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── main.jsx
│   └── firebase.js
├── index.html
├── package.json
├── vite.config.js
└── .env.example
```

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

### Vercel (Recommended)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repo
4. Add environment variables if using Firebase
5. Deploy!

### GitHub Pages
```bash
npm run build
# Upload the 'dist' folder to GitHub Pages
```

## 📝 License

Free for personal use. Built with ❤️ for families.

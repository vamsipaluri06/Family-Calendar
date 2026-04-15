// App version and changelog
export const APP_VERSION = '2.3.0';
export const BUILD_DATE = '2026-04-15';

export const CHANGELOG = [
  {
    version: '2.3.0',
    date: '2026-04-15',
    changes: [
      '📊 Expense Pie Chart - Visual spending breakdown by store',
      '📅 Calendar Navigation - Inline "< April >" style arrows',
      '🎯 Today Button - Centered below month navigation',
      '🎨 Improved chart styling with legend and centered total',
      '📱 Better mobile calendar toolbar layout'
    ]
  },
  {
    version: '2.2.0',
    date: '2026-04-14',
    changes: [
      '🌙 Dark Theme - Toggle between light and dark mode',
      '✅ Event Completion - Mark events done with checkbox',
      '📊 Monthly Expense Details - Click to view all expenses',
      '📈 Yearly Expense Breakdown - View monthly totals',
      '📱 Improved mobile navigation'
    ]
  },
  {
    version: '2.1.0',
    date: '2026-04-14',
    changes: [
      '📱 PWA Support - Install as app on iPhone/Android!',
      '🔄 Offline caching with service worker',
      '🎨 Custom app icon for home screen'
    ]
  },
  {
    version: '2.0.0',
    date: '2026-04-14',
    changes: [
      '🔒 Added password hashing for security (SHA-256)',
      '🏠 Added Monthly Utilities tracking (Rent, Electricity, Internet, Mobile)',
      '🐛 Fixed timezone bug for utility date handling',
      '📱 Improved mobile navigation'
    ]
  },
  {
    version: '1.5.0',
    date: '2026-04-13',
    changes: [
      '💳 Added Credit Cards rewards tracker',
      '💰 Added Expense tracking by store',
      '🛒 Added Grocery List with store selection'
    ]
  },
  {
    version: '1.0.0',
    date: '2026-04-01',
    changes: [
      '📅 Initial release',
      '👨‍👩‍👧 Family member management',
      '🍽️ Meal planning feature',
      '📱 Mobile-responsive design',
      '🔥 Firebase real-time sync'
    ]
  }
];

export const getLatestChanges = () => CHANGELOG[0];

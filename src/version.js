// App version and changelog
export const APP_VERSION = '2.0.0';
export const BUILD_DATE = '2026-04-14';

export const CHANGELOG = [
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

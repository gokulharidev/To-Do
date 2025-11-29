// OAuth Configuration for External Calendar Integration

export const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
  scopes: [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly'
  ],
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  redirectUri: import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5175/oauth/callback'
};

export const MICROSOFT_CONFIG = {
  clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
  scopes: [
    'Calendars.Read',
    'User.Read'
  ],
  authEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  graphEndpoint: 'https://graph.microsoft.com/v1.0',
  redirectUri: import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5175/oauth/callback'
};

export const APP_CONFIG = {
  syncIntervalMinutes: parseInt(import.meta.env.VITE_SYNC_INTERVAL_MINUTES || '5'),
  autoStartTimerEnabled: import.meta.env.VITE_AUTO_START_TIMER_ENABLED === 'true',
  eventNotificationMinutes: parseInt(import.meta.env.VITE_EVENT_NOTIFICATION_MINUTES || '5')
};

// Storage keys for tokens
export const STORAGE_KEYS = {
  GOOGLE_TOKEN: 'timetracker_google_token',
  GOOGLE_REFRESH_TOKEN: 'timetracker_google_refresh_token',
  GOOGLE_EXPIRES_AT: 'timetracker_google_expires_at',
  MICROSOFT_TOKEN: 'timetracker_microsoft_token',
  MICROSOFT_REFRESH_TOKEN: 'timetracker_microsoft_refresh_token',
  MICROSOFT_EXPIRES_AT: 'timetracker_microsoft_expires_at',
  EXTERNAL_EVENTS: 'timetracker_external_events',
  LAST_SYNC: 'timetracker_last_sync'
};

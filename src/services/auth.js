// OAuth Authentication Service
import { GOOGLE_CONFIG, MICROSOFT_CONFIG, STORAGE_KEYS } from '../config/oauth.js';

// Generate PKCE code verifier and challenge
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

function base64UrlEncode(array) {
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Generate random state for CSRF protection
function generateState() {
  return Math.random().toString(36).substring(2, 15);
}

// Google OAuth
export async function initiateGoogleAuth() {
  if (!GOOGLE_CONFIG.clientId) {
    throw new Error('Google Client ID not configured. Please add VITE_GOOGLE_CLIENT_ID to .env file.');
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  // Store for verification
  sessionStorage.setItem('google_code_verifier', codeVerifier);
  sessionStorage.setItem('google_state', state);

  const params = new URLSearchParams({
    client_id: GOOGLE_CONFIG.clientId,
    redirect_uri: GOOGLE_CONFIG.redirectUri,
    response_type: 'code',
    scope: GOOGLE_CONFIG.scopes.join(' '),
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    prompt: 'consent'
  });

  window.location.href = `${GOOGLE_CONFIG.authEndpoint}?${params.toString()}`;
}

// Microsoft OAuth
export async function initiateMicrosoftAuth() {
  if (!MICROSOFT_CONFIG.clientId) {
    throw new Error('Microsoft Client ID not configured. Please add VITE_MICROSOFT_CLIENT_ID to .env file.');
  }

  const state = generateState();
  sessionStorage.setItem('microsoft_state', state);

  const params = new URLSearchParams({
    client_id: MICROSOFT_CONFIG.clientId,
    redirect_uri: MICROSOFT_CONFIG.redirectUri,
    response_type: 'code',
    scope: MICROSOFT_CONFIG.scopes.join(' '),
    state: state,
    response_mode: 'query'
  });

  window.location.href = `${MICROSOFT_CONFIG.authEndpoint}?${params.toString()}`;
}

// Handle OAuth callback
export async function handleOAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');

  if (error) {
    throw new Error(`OAuth error: ${error}`);
  }

  if (!code || !state) {
    throw new Error('Invalid OAuth callback');
  }

  // Determine which provider based on stored state
  const googleState = sessionStorage.getItem('google_state');
  const microsoftState = sessionStorage.getItem('microsoft_state');

  if (state === googleState) {
    await exchangeGoogleCode(code);
    sessionStorage.removeItem('google_state');
    sessionStorage.removeItem('google_code_verifier');
    return 'google';
  } else if (state === microsoftState) {
    await exchangeMicrosoftCode(code);
    sessionStorage.removeItem('microsoft_state');
    return 'microsoft';
  } else {
    throw new Error('Invalid state parameter');
  }
}

// Exchange Google authorization code for tokens
async function exchangeGoogleCode(code) {
  const codeVerifier = sessionStorage.getItem('google_code_verifier');
  
  const params = new URLSearchParams({
    code: code,
    client_id: GOOGLE_CONFIG.clientId,
    redirect_uri: GOOGLE_CONFIG.redirectUri,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier
  });

  const response = await fetch(GOOGLE_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Google authorization code');
  }

  const data = await response.json();
  storeGoogleTokens(data);
}

// Exchange Microsoft authorization code for tokens
async function exchangeMicrosoftCode(code) {
  const params = new URLSearchParams({
    code: code,
    client_id: MICROSOFT_CONFIG.clientId,
    redirect_uri: MICROSOFT_CONFIG.redirectUri,
    grant_type: 'authorization_code',
    scope: MICROSOFT_CONFIG.scopes.join(' ')
  });

  const response = await fetch(MICROSOFT_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Microsoft authorization code');
  }

  const data = await response.json();
  storeMicrosoftTokens(data);
}

// Store Google tokens
function storeGoogleTokens(tokenData) {
  const expiresAt = Date.now() + (tokenData.expires_in * 1000);
  localStorage.setItem(STORAGE_KEYS.GOOGLE_TOKEN, tokenData.access_token);
  localStorage.setItem(STORAGE_KEYS.GOOGLE_EXPIRES_AT, expiresAt.toString());
  if (tokenData.refresh_token) {
    localStorage.setItem(STORAGE_KEYS.GOOGLE_REFRESH_TOKEN, tokenData.refresh_token);
  }
}

// Store Microsoft tokens
function storeMicrosoftTokens(tokenData) {
  const expiresAt = Date.now() + (tokenData.expires_in * 1000);
  localStorage.setItem(STORAGE_KEYS.MICROSOFT_TOKEN, tokenData.access_token);
  localStorage.setItem(STORAGE_KEYS.MICROSOFT_EXPIRES_AT, expiresAt.toString());
  if (tokenData.refresh_token) {
    localStorage.setItem(STORAGE_KEYS.MICROSOFT_REFRESH_TOKEN, tokenData.refresh_token);
  }
}

// Refresh Google token
export async function refreshGoogleToken() {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.GOOGLE_REFRESH_TOKEN);
  
  if (!refreshToken) {
    throw new Error('No Google refresh token available');
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CONFIG.clientId,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  });

  const response = await fetch(GOOGLE_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    clearGoogleTokens();
    throw new Error('Failed to refresh Google token');
  }

  const data = await response.json();
  storeGoogleTokens(data);
  return data.access_token;
}

// Refresh Microsoft token
export async function refreshMicrosoftToken() {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.MICROSOFT_REFRESH_TOKEN);
  
  if (!refreshToken) {
    throw new Error('No Microsoft refresh token available');
  }

  const params = new URLSearchParams({
    client_id: MICROSOFT_CONFIG.clientId,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
    scope: MICROSOFT_CONFIG.scopes.join(' ')
  });

  const response = await fetch(MICROSOFT_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    clearMicrosoftTokens();
    throw new Error('Failed to refresh Microsoft token');
  }

  const data = await response.json();
  storeMicrosoftTokens(data);
  return data.access_token;
}

// Get valid Google access token (refresh if needed)
export async function getGoogleAccessToken() {
  const token = localStorage.getItem(STORAGE_KEYS.GOOGLE_TOKEN);
  const expiresAt = parseInt(localStorage.getItem(STORAGE_KEYS.GOOGLE_EXPIRES_AT) || '0');

  if (!token) {
    return null;
  }

  // Refresh if token expires in less than 5 minutes
  if (Date.now() + (5 * 60 * 1000) >= expiresAt) {
    return await refreshGoogleToken();
  }

  return token;
}

// Get valid Microsoft access token (refresh if needed)
export async function getMicrosoftAccessToken() {
  const token = localStorage.getItem(STORAGE_KEYS.MICROSOFT_TOKEN);
  const expiresAt = parseInt(localStorage.getItem(STORAGE_KEYS.MICROSOFT_EXPIRES_AT) || '0');

  if (!token) {
    return null;
  }

  // Refresh if token expires in less than 5 minutes
  if (Date.now() + (5 * 60 * 1000) >= expiresAt) {
    return await refreshMicrosoftToken();
  }

  return token;
}

// Check if Google is connected
export function isGoogleConnected() {
  return !!localStorage.getItem(STORAGE_KEYS.GOOGLE_TOKEN);
}

// Check if Microsoft is connected
export function isMicrosoftConnected() {
  return !!localStorage.getItem(STORAGE_KEYS.MICROSOFT_TOKEN);
}

// Clear Google tokens (disconnect)
export function clearGoogleTokens() {
  localStorage.removeItem(STORAGE_KEYS.GOOGLE_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.GOOGLE_REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.GOOGLE_EXPIRES_AT);
}

// Clear Microsoft tokens (disconnect)
export function clearMicrosoftTokens() {
  localStorage.removeItem(STORAGE_KEYS.MICROSOFT_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.MICROSOFT_REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.MICROSOFT_EXPIRES_AT);
}

// Clear all tokens
export function clearAllTokens() {
  clearGoogleTokens();
  clearMicrosoftTokens();
  localStorage.removeItem(STORAGE_KEYS.EXTERNAL_EVENTS);
  localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
}

// Get stored tokens info
export function getStoredTokens() {
  return {
    google: {
      connected: isGoogleConnected(),
      expiresAt: parseInt(localStorage.getItem(STORAGE_KEYS.GOOGLE_EXPIRES_AT) || '0')
    },
    microsoft: {
      connected: isMicrosoftConnected(),
      expiresAt: parseInt(localStorage.getItem(STORAGE_KEYS.MICROSOFT_EXPIRES_AT) || '0')
    }
  };
}

// Microsoft Graph Calendar Service using MSAL.js
import { PublicClientApplication } from 'https://cdn.jsdelivr.net/npm/@azure/msal-browser@3.0.0/+esm';

const msalConfig = {
    auth: {
        clientId: 'd810b8df-fa99-4db9-87f9-09a4f5b3bbf2',
        authority: 'https://login.microsoftonline.com/4d165d47-548c-459c-abc1-bd687ecbb02f',
        redirectUri: window.location.origin
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false
    }
};

const loginRequest = {
    scopes: ['Calendars.Read', 'User.Read']
};

export class MicrosoftGraphService {
    constructor() {
        this.msalInstance = null;
        this.account = null;
        this.events = [];
        this.lastSync = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) {
            return; // Already initialized
        }

        try {
            this.msalInstance = new PublicClientApplication(msalConfig);
            await this.msalInstance.initialize();
            await this.msalInstance.handleRedirectPromise();

            const accounts = this.msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                this.account = accounts[0];
            }

            this.isInitialized = true;
            console.log('Microsoft Graph initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Microsoft Graph:', error);
            throw error;
        }
    }

    async signIn() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const response = await this.msalInstance.loginPopup(loginRequest);
            this.account = response.account;
            return this.account;
        } catch (error) {
            console.error('Sign-in error:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            await this.msalInstance.logoutPopup();
            this.account = null;
            this.events = [];
            this.lastSync = null;
        } catch (error) {
            console.error('Sign-out error:', error);
            throw error;
        }
    }

    isAuthenticated() {
        return this.account !== null;
    }

    getAccount() {
        return this.account;
    }

    async getAccessToken() {
        if (!this.isInitialized) {
            throw new Error('Microsoft Graph not initialized. Please call initialize() first.');
        }

        if (!this.account) {
            throw new Error('No account found. Please sign in first.');
        }

        const request = {
            scopes: loginRequest.scopes,
            account: this.account
        };

        try {
            const response = await this.msalInstance.acquireTokenSilent(request);
            return response.accessToken;
        } catch (error) {
            console.warn('Silent token acquisition failed, trying popup:', error);
            const response = await this.msalInstance.acquireTokenPopup(request);
            return response.accessToken;
        }
    }

    async fetchCalendarEvents(startDate, endDate) {
        try {
            const accessToken = await this.getAccessToken();

            const startDateTime = startDate.toISOString();
            const endDateTime = endDate.toISOString();

            const url = `https://graph.microsoft.com/v1.0/me/calendarview` +
                `?startDateTime=${startDateTime}` +
                `&endDateTime=${endDateTime}` +
                `&$select=subject,start,end,location,bodyPreview,organizer,isAllDay` +
                `&$orderby=start/dateTime` +
                `&$top=100`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Graph API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            this.events = this.parseGraphEvents(data.value);
            this.lastSync = new Date();

            console.log(`Successfully fetched ${this.events.length} events from Microsoft Graph`);
            return this.events;
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            throw error;
        }
    }

    parseGraphEvents(graphEvents) {
        return graphEvents.map(event => ({
            id: `graph-${event.id}`,
            title: event.subject || 'Untitled Event',
            start: new Date(event.start.dateTime + 'Z'), // Add Z for UTC
            end: new Date(event.end.dateTime + 'Z'),
            location: event.location?.displayName || '',
            description: event.bodyPreview || '',
            organizer: event.organizer?.emailAddress?.name || '',
            isAllDay: event.isAllDay || false,
            source: 'outlook-graph'
        }));
    }

    getEventsForDate(date) {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        return this.events.filter(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);

            return (eventStart < nextDay && eventEnd > targetDate);
        });
    }

    getEventsForMonth(year, month) {
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

        return this.events.filter(event => {
            const eventStart = new Date(event.start);
            return eventStart >= startOfMonth && eventStart <= endOfMonth;
        });
    }

    getLastSyncTime() {
        if (!this.lastSync) return null;

        const now = new Date();
        const diffMs = now - this.lastSync;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins === 1) return '1 minute ago';
        return `${diffMins} minutes ago`;
    }
}

// Singleton instance
export const microsoftGraph = new MicrosoftGraphService();

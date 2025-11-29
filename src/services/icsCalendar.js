// ICS Calendar Service - Fetch and parse Outlook Calendar feed
const ICS_FEED_URL = 'https://outlook.office365.com/owa/calendar/93ff494cfe974854aa324965f213f3e2@onedatasoftware.com/5e0e30460b844d67afb4b898fb462d7f18046826676186521310/calendar.ics';
const CORS_PROXY = 'https://corsproxy.io/?';

export class ICSCalendarService {
    constructor() {
        this.events = [];
        this.lastSync = null;
    }

    async fetchAndParse() {
        try {
            // Try direct fetch first (in case CORS is enabled)
            let response = await fetch(ICS_FEED_URL);

            // If direct fetch fails with CORS, try proxy
            if (!response.ok) {
                console.log('Direct fetch failed, trying CORS proxy...');
                response = await fetch(CORS_PROXY + encodeURIComponent(ICS_FEED_URL));
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch calendar: ${response.status} ${response.statusText}`);
            }

            const icsData = await response.text();
            this.events = this.parseICS(icsData);
            this.lastSync = new Date();

            console.log(`Successfully synced ${this.events.length} events`);
            return this.events;
        } catch (error) {
            console.error('Error fetching calendar:', error);
            throw error;
        }
    }

    parseICS(icsData) {
        const events = [];
        const lines = icsData.split(/\r\n|\n|\r/);
        let currentEvent = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line === 'BEGIN:VEVENT') {
                currentEvent = {
                    id: `outlook-${Date.now()}-${Math.random()}`,
                    source: 'outlook'
                };
            } else if (line === 'END:VEVENT' && currentEvent) {
                if (currentEvent.start && currentEvent.end) {
                    events.push(currentEvent);
                }
                currentEvent = null;
            } else if (currentEvent) {
                // Parse event properties
                if (line.startsWith('SUMMARY:')) {
                    currentEvent.title = this.unescapeICS(line.substring(8));
                } else if (line.startsWith('DTSTART')) {
                    currentEvent.start = this.parseDateTime(line);
                } else if (line.startsWith('DTEND')) {
                    currentEvent.end = this.parseDateTime(line);
                } else if (line.startsWith('DESCRIPTION:')) {
                    currentEvent.description = this.unescapeICS(line.substring(12));
                } else if (line.startsWith('LOCATION:')) {
                    currentEvent.location = this.unescapeICS(line.substring(9));
                } else if (line.startsWith('UID:')) {
                    currentEvent.uid = line.substring(4);
                }
            }
        }

        return events;
    }

    parseDateTime(line) {
        // Extract datetime value from lines like "DTSTART:20251130T100000Z" or "DTSTART;VALUE=DATE:20251130"
        const match = line.match(/:([\dTZ]+)$/);
        if (!match) return null;

        const dateStr = match[1];

        // Handle all-day events (DATE format: YYYYMMDD)
        if (dateStr.length === 8) {
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            return new Date(`${year}-${month}-${day}T00:00:00`);
        }

        // Handle datetime (YYYYMMDDTHHMMSSZ)
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const hour = dateStr.substring(9, 11);
        const minute = dateStr.substring(11, 13);
        const second = dateStr.substring(13, 15);

        return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
    }

    unescapeICS(text) {
        return text
            .replace(/\\n/g, '\n')
            .replace(/\\,/g, ',')
            .replace(/\\;/g, ';')
            .replace(/\\\\/g, '\\');
    }

    getEventsForDate(date) {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        return this.events.filter(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);

            // Event overlaps with target date
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
export const icsCalendar = new ICSCalendarService();

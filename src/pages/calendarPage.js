// CALENDAR Page - Full calendar view with Microsoft Graph integration
import { getSessionsByDate } from '../utils/sessionStorage.js';
import { microsoftGraph } from '../services/microsoftGraph.js';

export class CalendarPage {
    constructor(container) {
        this.container = container;
        this.currentDate = new Date();
        this.outlookEvents = [];
        this.syncInterval = null;
        this.render();
    }

    async show() {
        this.container.classList.remove('hidden');

        // Initialize Microsoft Graph
        await microsoftGraph.initialize();

        this.render(); // Re-render to show correct auth state

        // Only start auto-sync if authenticated
        if (microsoftGraph.isAuthenticated()) {
            this.startAutoSync();
        }
    }

    hide() {
        this.container.classList.add('hidden');
        this.stopAutoSync();
    }

    startAutoSync() {
        // Initial sync
        this.syncOutlookCalendar();

        // Auto-sync every 1 minute
        this.syncInterval = setInterval(() => {
            this.syncOutlookCalendar();
        }, 60000);
    }

    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    async syncOutlookCalendar() {
        if (!microsoftGraph.isAuthenticated()) {
            console.log('Not authenticated, skipping sync');
            return;
        }

        try {
            // Fetch events for current month
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0, 23, 59, 59);

            this.outlookEvents = await microsoftGraph.fetchCalendarEvents(startDate, endDate);
            this.renderCalendar();
            this.updateSyncStatus();
        } catch (error) {
            console.error('Sync failed:', error);
            this.updateSyncStatus('Sync failed');
        }
    }

    updateSyncStatus(errorMsg = null) {
        const statusEl = this.container.querySelector('#sync-status');
        if (statusEl) {
            if (errorMsg) {
                statusEl.textContent = errorMsg;
                statusEl.style.color = 'var(--danger)';
            } else {
                const syncTime = microsoftGraph.getLastSyncTime();
                const account = microsoftGraph.getAccount();
                const userInfo = account ? ` (${account.username})` : '';
                statusEl.textContent = syncTime ? `Last synced: ${syncTime}${userInfo}` : 'Syncing...';
                statusEl.style.color = 'var(--text-secondary)';
            }
        }
    }

    render() {
        const isAuthenticated = microsoftGraph.isAuthenticated();
        const account = microsoftGraph.getAccount();

        this.container.innerHTML = `
      <div class="page calendar-page-layout">
        <div class="calendar-header">
          <div class="calendar-title-section">
            <h1 class="page-title">📅 Calendar</h1>
            <div class="outlook-auth-section">
              ${isAuthenticated ? `
                <div class="user-info">
                  <span class="user-email">${account?.username || 'Connected'}</span>
                  <button class="btn btn-secondary squircle-sm" id="outlook-disconnect">Disconnect</button>
                </div>
              ` : `
                <button class="btn btn-primary squircle" id="outlook-connect">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="margin-right: 8px;">
                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.758 2.855L15 11.114v-5.73zm-.034 6.878L9.271 8.82 8 9.583 6.728 8.82l-5.694 3.44A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.739zM1 11.114l4.758-2.876L1 5.383v5.73z"/>
                  </svg>
                  Connect Outlook
                </button>
              `}
            </div>
          </div>
          <div class="calendar-controls">
            <button class="icon-btn squircle" id="cal-prev-month">‹</button>
            <h2 id="cal-month-year"></h2>
            <button class="icon-btn squircle" id="cal-next-month">›</button>
          </div>
          <div class="sync-status" id="sync-status">${isAuthenticated ? 'Ready to sync' : 'Connect Outlook to sync calendar'}</div>
        </div>
        <div class="calendar-grid" id="calendar-grid"></div>
        <div id="event-modal-container"></div>
      </div>
    `;

        this.attachEvents();
        this.renderCalendar();
    }

    attachEvents() {
        this.container.querySelector('#cal-prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
            if (microsoftGraph.isAuthenticated()) {
                this.syncOutlookCalendar();
            }
        });

        this.container.querySelector('#cal-next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
            if (microsoftGraph.isAuthenticated()) {
                this.syncOutlookCalendar();
            }
        });

        // Outlook Connect button
        const connectBtn = this.container.querySelector('#outlook-connect');
        if (connectBtn) {
            connectBtn.addEventListener('click', async () => {
                try {
                    await microsoftGraph.signIn();
                    this.render(); // Re-render to show disconnect button
                    this.startAutoSync();
                } catch (error) {
                    alert('Failed to connect to Outlook: ' + error.message);
                }
            });
        }

        // Outlook Disconnect button
        const disconnectBtn = this.container.querySelector('#outlook-disconnect');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', async () => {
                try {
                    await microsoftGraph.signOut();
                    this.stopAutoSync();
                    this.render(); // Re-render to show connect button
                } catch (error) {
                    alert('Failed to disconnect: ' + error.message);
                }
            });
        }
    }

    renderCalendar() {
        const grid = this.container.querySelector('#calendar-grid');
        const monthYear = this.container.querySelector('#cal-month-year');

        if (!grid || !monthYear) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        monthYear.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        grid.innerHTML = '';

        // Days of week header
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const el = document.createElement('div');
            el.className = 'calendar-day-header text-secondary';
            el.textContent = day;
            grid.appendChild(el);
        });

        // Calendar days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        // Empty cells for previous month
        for (let i = 0; i < startDay; i++) {
            const el = document.createElement('div');
            el.className = 'calendar-day empty';
            grid.appendChild(el);
        }

        // Days
        const today = new Date();
        for (let i = 1; i <= totalDays; i++) {
            const date = new Date(year, month, i);
            const el = document.createElement('div');
            el.className = 'calendar-day squircle';

            if (date.toDateString() === today.toDateString()) {
                el.classList.add('today');
            }

            // Check for local sessions
            const sessions = getSessionsByDate(date);
            const hasSessions = sessions.length > 0;

            // Check for Outlook events
            const outlookEvents = microsoftGraph.getEventsForDate(date);
            const hasOutlookEvents = outlookEvents.length > 0;

            el.innerHTML = `
        <div class="day-number">${i}</div>
        <div class="event-indicators">
          ${hasSessions ? `<div class="session-dot" title="${sessions.length} session(s)"></div>` : ''}
          ${hasOutlookEvents ? `<div class="outlook-event-dot" title="${outlookEvents.length} event(s)"></div>` : ''}
        </div>
      `;

            // Click handler to show events
            if (hasSessions || hasOutlookEvents) {
                el.style.cursor = 'pointer';
                el.addEventListener('click', () => this.showDayEvents(date, sessions, outlookEvents));
            }

            grid.appendChild(el);
        }
    }

    showDayEvents(date, sessions, outlookEvents) {
        const modalContainer = this.container.querySelector('#event-modal-container');

        const dateStr = date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        let eventsHTML = '';

        // Local sessions
        if (sessions.length > 0) {
            eventsHTML += `<h3 class="event-section-title">Focus Sessions</h3>`;
            sessions.forEach(session => {
                const startTime = new Date(session.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                const endTime = new Date(session.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                eventsHTML += `
          <div class="event-item session-event">
            <div class="event-time">${startTime} - ${endTime}</div>
            <div class="event-title">${session.taskName || 'Untitled'}</div>
            <div class="event-meta">
              <span class="badge badge-${session.mode}">${session.mode}</span>
            </div>
          </div>
        `;
            });
        }

        // Outlook events
        if (outlookEvents.length > 0) {
            eventsHTML += `<h3 class="event-section-title">Outlook Calendar</h3>`;
            outlookEvents.forEach(event => {
                const startTime = new Date(event.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                const endTime = new Date(event.end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                eventsHTML += `
          <div class="event-item outlook-event">
            <div class="event-time">${startTime} - ${endTime}</div>
            <div class="event-title">${event.title}</div>
            ${event.location ? `<div class="event-location">📍 ${event.location}</div>` : ''}
            ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
            ${event.organizer ? `<div class="event-organizer">👤 ${event.organizer}</div>` : ''}
          </div>
        `;
            });
        }

        modalContainer.innerHTML = `
      <div class="modal-overlay event-modal-overlay">
        <div class="modal event-details-modal squircle">
          <div class="modal-header">
            <h2>${dateStr}</h2>
            <button class="icon-btn close-btn squircle-sm" id="event-modal-close">✕</button>
          </div>
          <div class="modal-content event-list">
            ${eventsHTML}
          </div>
        </div>
      </div>
    `;

        modalContainer.querySelector('#event-modal-close').addEventListener('click', () => {
            modalContainer.innerHTML = '';
        });

        modalContainer.querySelector('.event-modal-overlay').addEventListener('click', (e) => {
            if (e.target.classList.contains('event-modal-overlay')) {
                modalContainer.innerHTML = '';
            }
        });
    }
}

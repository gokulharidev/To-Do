import { getEntriesByDate } from '../utils/storage.js';
import { formatDuration, formatTimeForInput, isToday } from '../utils/utils.js';
import { createCategoryBadge } from '../utils/categories.js';

export class Timeline {
    constructor(container, onEdit, onDelete) {
        this.container = container;
        this.onEdit = onEdit;
        this.onDelete = onDelete;
        this.selectedDate = new Date();
        this.entries = [];

        this.loadEntries();
        this.render();
    }

    setDate(date) {
        this.selectedDate = date;
        this.loadEntries();
        this.render();
    }

    loadEntries() {
        this.entries = getEntriesByDate(this.selectedDate);
        // Sort entries: newest first based on startTime
        this.entries.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    }

    getTotalDuration() {
        return this.entries.reduce((total, entry) => total + entry.duration, 0);
    }

    render() {
        const totalDuration = this.getTotalDuration();
        const dateLabel = isToday(this.selectedDate) ? 'Today' : this.selectedDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        this.container.innerHTML = `
      <div class="card">
        <div class="timeline-header">
          <h2>Time Logs - ${dateLabel}</h2>
          <div class="timeline-summary">
            ${this.entries.length} ${this.entries.length === 1 ? 'entry' : 'entries'} · 
            ${formatDuration(totalDuration)} total
          </div>
        </div>
        
        ${this.entries.length === 0 ? this.renderEmptyState() : this.renderEntries()}
      </div>
    `;

        this.attachEventListeners();
    }

    renderEmptyState() {
        return `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-text">No tasks recorded on this date.</div>
      </div>
    `;
    }

    renderEntries() {
        return `
      <div class="timeline-list">
        ${this.entries.map(entry => this.renderEntry(entry)).join('')}
      </div>
    `;
    }

    renderEntry(entry) {
        const startTime = new Date(entry.startTime);
        const endTime = new Date(entry.endTime);
        const startStr = startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const endStr = endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        return `
      <div class="timeline-entry" data-id="${entry.id}">
        <div class="timeline-entry-header">
          <div class="timeline-entry-title">${entry.taskName}</div>
          <div class="timeline-entry-actions">
            <button class="icon-btn edit-btn" data-id="${entry.id}" title="Edit">
              ✏️
            </button>
            <button class="icon-btn delete-btn" data-id="${entry.id}" title="Delete">
              🗑️
            </button>
          </div>
        </div>
        <div class="timeline-entry-meta">
          <span class="badge ${this.getCategoryClass(entry.category)}">${entry.category}</span>
          <span>${startStr} - ${endStr}</span>
          <span>${formatDuration(entry.duration)}</span>
          ${entry.notes ? '<span title="Has notes">📝</span>' : ''}
        </div>
      </div>
    `;
    }

    getCategoryClass(category) {
        const normalized = category.toLowerCase();

        if (normalized.includes('meeting prep')) return 'badge-prep';
        if (normalized.includes('meeting')) return 'badge-meeting';
        if (normalized.includes('focus')) return 'badge-focus';
        if (normalized.includes('admin')) return 'badge-admin';
        if (normalized.includes('break')) return 'badge-break';

        return 'badge-other';
    }

    attachEventListeners() {
        const editBtns = this.container.querySelectorAll('.edit-btn');
        const deleteBtns = this.container.querySelectorAll('.delete-btn');

        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (this.onEdit) {
                    this.onEdit(id);
                }
            });
        });

        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (confirm('Are you sure you want to delete this entry?')) {
                    if (this.onDelete) {
                        this.onDelete(id);
                    }
                }
            });
        });
    }

    refresh() {
        this.loadEntries();
        this.render();
    }
}

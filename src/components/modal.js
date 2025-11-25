import { getEntryById, updateEntry } from '../utils/storage.js';
import { formatDateForInput, formatTimeForInput, getSecondsBetween } from '../utils/utils.js';
import { CATEGORIES } from '../utils/categories.js';

export class Modal {
    constructor(onSave, onClose) {
        this.onSave = onSave;
        this.onClose = onClose;
        this.entry = null;
        this.overlay = null;
    }

    open(entryId) {
        this.entry = getEntryById(entryId);
        if (!this.entry) {
            console.error('Entry not found:', entryId);
            return;
        }

        this.render();
        this.attachEventListeners();
    }

    render() {
        // Remove existing modal if any
        this.close();

        const startDate = new Date(this.entry.startTime);
        const endDate = new Date(this.entry.endTime);

        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Edit Time Entry</h2>
          <button class="icon-btn" id="close-modal">✕</button>
        </div>
        
        <div class="input-group">
          <label class="input-label">Task Name</label>
          <input 
            type="text" 
            class="input" 
            id="edit-task-name" 
            value="${this.entry.taskName}"
          />
        </div>
        
        <div class="input-group">
          <label class="input-label">Category</label>
          <input 
            type="text" 
            class="input" 
            id="edit-category" 
            list="category-list"
            value="${this.entry.category}"
          />
          <datalist id="category-list">
            ${Object.keys(CATEGORIES).map(cat => `<option value="${cat}">`).join('')}
          </datalist>
        </div>
        
        <div class="input-group">
          <label class="input-label">Start Time</label>
          <input 
            type="datetime-local" 
            class="input" 
            id="edit-start-time" 
            value="${this.formatDateTimeLocal(startDate)}"
          />
        </div>
        
        <div class="input-group">
          <label class="input-label">End Time</label>
          <input 
            type="datetime-local" 
            class="input" 
            id="edit-end-time" 
            value="${this.formatDateTimeLocal(endDate)}"
          />
        </div>
        
        <div class="input-group">
          <label class="input-label">Notes</label>
          <textarea 
            class="textarea" 
            id="edit-notes"
          >${this.entry.notes || ''}</textarea>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" id="cancel-btn">Cancel</button>
          <button class="btn btn-primary" id="save-btn">Save Changes</button>
        </div>
      </div>
    `;

        document.body.appendChild(this.overlay);

        // Focus first input
        setTimeout(() => {
            this.overlay.querySelector('#edit-task-name')?.focus();
        }, 100);
    }

    formatDateTimeLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    attachEventListeners() {
        const closeBtn = this.overlay.querySelector('#close-modal');
        const cancelBtn = this.overlay.querySelector('#cancel-btn');
        const saveBtn = this.overlay.querySelector('#save-btn');

        closeBtn.addEventListener('click', () => this.close());
        cancelBtn.addEventListener('click', () => this.close());
        saveBtn.addEventListener('click', () => this.save());

        // Close on overlay click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Close on Escape key
        this.escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        };
        document.addEventListener('keydown', this.escapeHandler);
    }

    save() {
        const taskName = this.overlay.querySelector('#edit-task-name').value.trim();
        const category = this.overlay.querySelector('#edit-category').value.trim();
        const startTime = new Date(this.overlay.querySelector('#edit-start-time').value);
        const endTime = new Date(this.overlay.querySelector('#edit-end-time').value);
        const notes = this.overlay.querySelector('#edit-notes').value.trim();

        // Validation
        if (!taskName) {
            alert('Task name is required.');
            return;
        }

        if (startTime >= endTime) {
            alert('Start time must be before end time.');
            return;
        }

        // Calculate new duration
        const duration = getSecondsBetween(startTime, endTime);

        // Update entry
        const updated = updateEntry(this.entry.id, {
            taskName,
            category,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration,
            notes
        });

        if (updated && this.onSave) {
            this.onSave(updated);
        }

        this.close();
    }

    close() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }

        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }

        if (this.onClose) {
            this.onClose();
        }
    }
}

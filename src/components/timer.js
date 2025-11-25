// Timer component for the Time Tracker app
import { formatTime } from '../utils/utils.js';
import { addEntry } from '../utils/storage.js';
import { CATEGORIES } from '../utils/categories.js';

export class Timer {
    constructor(container, onEntryAdded) {
        this.container = container;
        this.onEntryAdded = onEntryAdded;
        this.isRunning = false;
        this.seconds = 0;
        this.interval = null;
        this.startTime = null;
        this.taskName = '';
        this.category = 'Focus Work';
        this.notes = '';
        this.render();
        this.attachEvents();
    }

    render() {
        this.container.innerHTML = `
      <div class="card">
        <h2>Active Timer</h2>
        <div class="timer-display">${formatTime(this.seconds)}</div>
        <div class="input-group">
          <label class="input-label">Task Name</label>
          <input type="text" class="input" id="task-name-input" placeholder="What are you working on?" value="${this.taskName}" />
        </div>
        <div class="input-group">
          <label class="input-label">Category</label>
          <select class="select" id="category-select">
            ${Object.keys(CATEGORIES).map(cat => `<option value="${cat}" ${cat === this.category ? 'selected' : ''}>${cat}</option>`).join('')}
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Notes (Optional)</label>
          <textarea class="textarea" id="notes-input" placeholder="Add any additional notes...">${this.notes}</textarea>
        </div>
        <button class="btn ${this.isRunning ? 'btn-danger' : 'btn-primary'}" id="timer-btn">
          ${this.isRunning ? '⏹ Stop Timer' : '▶ Start Timer'}
        </button>
      </div>
    `;
    }

    attachEvents() {
        const timerBtn = this.container.querySelector('#timer-btn');
        const taskInput = this.container.querySelector('#task-name-input');
        const catSelect = this.container.querySelector('#category-select');
        const notesInput = this.container.querySelector('#notes-input');

        if (timerBtn) timerBtn.onclick = () => this.toggle();
        if (taskInput) taskInput.oninput = e => (this.taskName = e.target.value);
        if (catSelect) catSelect.onchange = e => (this.category = e.target.value);
        if (notesInput) notesInput.oninput = e => (this.notes = e.target.value);
    }

    toggle() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }

    start() {
        if (!this.taskName.trim()) {
            alert('Please enter a task name before starting the timer.');
            return;
        }
        this.isRunning = true;
        this.startTime = new Date();
        this.seconds = 0;
        this.render();
        this.attachEvents();
        this.interval = setInterval(() => {
            this.seconds++;
            this.updateDisplay();
        }, 1000);
    }

    stop() {
        if (!this.isRunning) return;
        clearInterval(this.interval);
        this.isRunning = false;
        const endTime = new Date();
        const duration = Math.round((endTime - this.startTime) / 1000);
        const entry = {
            id: crypto.randomUUID(),
            taskName: this.taskName,
            category: this.category,
            startTime: this.startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration,
            notes: this.notes,
            createdAt: new Date().toISOString()
        };
        addEntry(entry);
        // Reset UI fields
        this.taskName = '';
        this.notes = '';
        this.seconds = 0;
        this.render();
        this.attachEvents();
        // Notify parent to refresh timeline
        if (this.onEntryAdded) this.onEntryAdded(entry);
    }

    updateDisplay() {
        const display = this.container.querySelector('.timer-display');
        if (display) display.textContent = formatTime(this.seconds);
    }
}

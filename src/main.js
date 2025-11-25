import './style.css';
import { Timer } from './components/timer.js';
import { Calendar } from './components/calendar.js';
import { Timeline } from './components/timeline.js';
import { Modal } from './components/modal.js';
import { deleteEntry } from './utils/storage.js';

class App {
  constructor() {
    this.timer = null;
    this.calendar = null;
    this.timeline = null;
    this.modal = null;

    this.init();
  }

  init() {
    document.querySelector('#app').innerHTML = `
      <h1>⏱️ Time Tracker</h1>
      <div class="app-container">
        <div class="left-panel">
          <div id="timer-container"></div>
          <div id="calendar-container"></div>
        </div>
        <div class="right-panel">
          <div id="timeline-container"></div>
        </div>
      </div>
    `;

    this.initComponents();
  }

  initComponents() {
    const timerContainer = document.querySelector('#timer-container');
    this.timer = new Timer(timerContainer, (entry) => {
      this.timeline.refresh();
    });

    const calendarContainer = document.querySelector('#calendar-container');
    this.calendar = new Calendar(calendarContainer, (date) => {
      this.timeline.setDate(date);
    });

    const timelineContainer = document.querySelector('#timeline-container');
    this.timeline = new Timeline(
      timelineContainer,
      (id) => this.modal.open(id),
      (id) => {
        if (deleteEntry(id)) {
          this.timeline.refresh();
        }
      }
    );

    this.modal = new Modal(
      () => this.timeline.refresh(),
      () => { }
    );

    this.timeline.setDate(this.calendar.getSelectedDate());
  }
}

// Initialize app
let app;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    window.app = app;
  });
} else {
  app = new App();
  window.app = app;
}

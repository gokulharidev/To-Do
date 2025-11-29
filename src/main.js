import './style.css';
import { router } from './router.js';
import { Navigation } from './components/navigation.js';
import { TimePage } from './pages/timePage.js';
import { CalendarPage } from './pages/calendarPage.js';
import { taskScheduler } from './services/taskScheduler.js';

class App {
  constructor() {
    this.init();
  }

  init() {
    // Set up main app structure
    document.querySelector('#app').innerHTML = `
      <div id="navigation-container"></div>
      <div id="time-container"></div>
      <div id="calendar-container"></div>
    `;

    // Initialize pages
    const timeContainer = document.querySelector('#time-container');
    const calendarContainer = document.querySelector('#calendar-container');

    const timePage = new TimePage(timeContainer);
    const calendarPage = new CalendarPage(calendarContainer);

    // Register pages with router
    router.registerPage('time', timePage);
    router.registerPage('calendar', calendarPage);

    // Initialize navigation
    const navigationContainer = document.querySelector('#navigation-container');
    new Navigation(navigationContainer);

    // Initialize router with default page
    router.init('time');

    // Start task scheduler
    taskScheduler.start((task) => {
      // Navigate to time page if not already there
      router.navigateTo('time');
      // Start timer with task
      timePage.startTask(task);
    });
  }
}

// Initialize app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new App();
  });
} else {
  new App();
}

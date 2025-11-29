// TIME Page - Main productivity workspace
import { SmartTimer } from '../components/smartTimer.js';
import { SessionLogs } from '../components/sessionLogs.js';
import { InsightsWidget } from '../components/insightsWidget.js';

export class TimePage {
  constructor(container) {
    this.container = container;
    this.timer = null;
    this.sessionLogs = null;
    this.render();
    this.initComponents();
  }

  show() {
    this.container.classList.remove('hidden');
  }

  hide() {
    this.container.classList.add('hidden');
  }

  render() {
    this.container.innerHTML = `
      <div class="page time-page-layout-focused">
        <div class="time-center-column">
          <div id="smart-timer-container"></div>
          <div id="insights-container"></div>
        </div>
      </div>
    `;
  }

  initComponents() {
    // Session Logs (Modal)
    this.sessionLogs = new SessionLogs(document.body);

    // Insights Widget
    const insightsContainer = this.container.querySelector('#insights-container');
    this.insights = new InsightsWidget(insightsContainer);

    // SmartTimer with callbacks
    const timerContainer = this.container.querySelector('#smart-timer-container');
    this.timer = new SmartTimer(
      timerContainer,
      () => {
        // On session added
        this.sessionLogs.refresh();
        this.insights.refresh();
      },
      () => {
        // On open logs
        this.sessionLogs.open();
      }
    );
  }

  startTask(task) {
    if (this.timer) {
      this.timer.startTask(task.title);
    }
  }
}

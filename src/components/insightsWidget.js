// Insights Widget for Analytics
import { getAllSessions } from '../utils/sessionStorage.js';
import { formatTimerDisplay } from '../utils/timerLogic.js';

export class InsightsWidget {
    constructor(container) {
        this.container = container;
        this.render();
    }

    refresh() {
        this.render();
    }

    getTodayStats() {
        const sessions = getAllSessions();
        const today = new Date().toISOString().split('T')[0];

        const todaySessions = sessions.filter(s => s.endTime.startsWith(today));

        const totalSeconds = todaySessions.reduce((acc, s) => acc + s.workDuration, 0);
        const sessionCount = todaySessions.length;

        // Category Breakdown
        const categoryMap = {};
        todaySessions.forEach(s => {
            const cat = s.category || 'Uncategorized';
            categoryMap[cat] = (categoryMap[cat] || 0) + s.workDuration;
        });

        // Convert to array and sort by duration
        const categories = Object.entries(categoryMap)
            .map(([name, duration]) => ({ name, duration }))
            .sort((a, b) => b.duration - a.duration);

        return {
            totalSeconds,
            sessionCount,
            categories
        };
    }

    render() {
        const stats = this.getTodayStats();

        // Calculate max duration for bar scaling
        const maxDuration = stats.categories.length > 0 ? stats.categories[0].duration : 1;

        this.container.innerHTML = `
      <div class="insights-widget squircle">
        <div class="insights-header">
          <h3>Today's Insights</h3>
        </div>
        
        <div class="insights-stats-row">
          <div class="stat-card">
            <span class="stat-value">${this.formatDuration(stats.totalSeconds)}</span>
            <span class="stat-label">Total Focus</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${stats.sessionCount}</span>
            <span class="stat-label">Sessions</span>
          </div>
        </div>

        <div class="insights-chart">
          <h4>Time by Category</h4>
          ${stats.categories.length === 0 ? '<p class="text-secondary text-center">No sessions yet</p>' : ''}
          <div class="chart-bars">
            ${stats.categories.map(cat => {
            const percentage = (cat.duration / maxDuration) * 100;
            return `
                <div class="chart-row">
                  <div class="chart-label">${cat.name}</div>
                  <div class="chart-bar-container">
                    <div class="chart-bar" style="width: ${percentage}%"></div>
                  </div>
                  <div class="chart-value">${this.formatDuration(cat.duration)}</div>
                </div>
              `;
        }).join('')}
          </div>
        </div>
      </div>
    `;
    }

    formatDuration(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    }
}

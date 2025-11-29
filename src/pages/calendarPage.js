// CALENDAR Page - Full calendar view
export class CalendarPage {
    constructor(container) {
        this.container = container;
        this.render();
    }

    show() {
        this.container.classList.remove('hidden');
    }

    hide() {
        this.container.classList.add('hidden');
    }

    render() {
        this.container.innerHTML = `
      <div class="page" id="calendar-page">
        <h1>📅 Calendar</h1>
        <p class="text-secondary">Calendar view - Coming soon</p>
      </div>
    `;
    }
}

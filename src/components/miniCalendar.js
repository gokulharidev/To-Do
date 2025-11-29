// Mini Calendar Component - Small embedded calendar for TIME page
export class MiniCalendar {
    constructor(container) {
        this.container = container;
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.render();
        this.attachEvents();
    }

    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const monthName = this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        this.container.innerHTML = `
      <div class="card mini-calendar-card squircle">
        <div class="mini-calendar-header">
          <button class="icon-btn squircle-sm" id="mini-prev-month">‹</button>
          <h4>${monthName}</h4>
          <button class="icon-btn squircle-sm" id="mini-next-month">›</button>
        </div>
        <div class="mini-calendar-grid">
          ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day =>
            `<div class="mini-calendar-day-header">${day}</div>`
        ).join('')}
          ${this.renderDays(startingDayOfWeek, daysInMonth, year, month)}
        </div>
      </div>
    `;
    }

    renderDays(startingDay, daysInMonth, year, month) {
        let html = '';

        // Empty cells before first day
        for (let i = 0; i < startingDay; i++) {
            html += '<div class="mini-calendar-day empty"></div>';
        }

        // Days of month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = this.isSameDay(date, today);
            const isSelected = this.isSameDay(date, this.selectedDate);

            html += `
        <div class="mini-calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-date="${date.toISOString()}">
          ${day}
        </div>
      `;
        }

        return html;
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    }

    attachEvents() {
        const prevBtn = this.container.querySelector('#mini-prev-month');
        const nextBtn = this.container.querySelector('#mini-next-month');
        const days = this.container.querySelectorAll('.mini-calendar-day:not(.empty)');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.render();
                this.attachEvents();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.render();
                this.attachEvents();
            });
        }

        days.forEach(day => {
            day.addEventListener('click', () => {
                this.selectedDate = new Date(day.dataset.date);
                this.render();
                this.attachEvents();
            });
        });
    }
}

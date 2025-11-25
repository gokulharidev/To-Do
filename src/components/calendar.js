export class Calendar {
    constructor(container, onDateSelected) {
        this.container = container;
        this.onDateSelected = onDateSelected;
        this.currentDate = new Date();
        this.selectedDate = new Date();

        this.render();
        this.attachEventListeners();
    }

    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        const monthName = this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Build calendar grid
        let calendarHTML = '';

        // Day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            calendarHTML += `<div class="calendar-day-header">${day}</div>`;
        });

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            calendarHTML += `<div class="calendar-day other-month" data-date="${year}-${month}-${day}">${day}</div>`;
        }

        // Current month days
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = this.isSameDay(date, today);
            const isSelected = this.isSameDay(date, this.selectedDate);

            const classes = ['calendar-day'];
            if (isToday) classes.push('today');
            if (isSelected) classes.push('selected');

            const dateStr = `${year}-${month + 1}-${day}`;
            calendarHTML += `<div class="${classes.join(' ')}" data-date="${dateStr}">${day}</div>`;
        }

        // Next month days
        const totalCells = firstDay + daysInMonth;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let day = 1; day <= remainingCells; day++) {
            calendarHTML += `<div class="calendar-day other-month" data-date="${year}-${month + 2}-${day}">${day}</div>`;
        }

        this.container.innerHTML = `
      <div class="card calendar">
        <div class="calendar-header">
          <h3 class="calendar-title">${monthName}</h3>
          <div class="calendar-nav">
            <button class="calendar-nav-btn" id="prev-month">◀</button>
            <button class="calendar-nav-btn" id="next-month">▶</button>
          </div>
        </div>
        <div class="calendar-grid">
          ${calendarHTML}
        </div>
      </div>
    `;
    }

    attachEventListeners() {
        const prevBtn = this.container.querySelector('#prev-month');
        const nextBtn = this.container.querySelector('#next-month');
        const days = this.container.querySelectorAll('.calendar-day:not(.other-month)');

        prevBtn?.addEventListener('click', () => this.previousMonth());
        nextBtn?.addEventListener('click', () => this.nextMonth());

        days.forEach(day => {
            day.addEventListener('click', (e) => {
                const dateStr = e.target.dataset.date;
                if (dateStr) {
                    const [year, month, dayNum] = dateStr.split('-').map(Number);
                    this.selectedDate = new Date(year, month - 1, dayNum);
                    this.render();
                    this.attachEventListeners();

                    if (this.onDateSelected) {
                        this.onDateSelected(this.selectedDate);
                    }
                }
            });
        });
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
        this.attachEventListeners();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
        this.attachEventListeners();
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }

    getSelectedDate() {
        return this.selectedDate;
    }
}

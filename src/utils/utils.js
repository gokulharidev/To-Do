// UUID generator
export function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Format seconds to HH:MM:SS
export function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hours, minutes, secs]
        .map(val => String(val).padStart(2, '0'))
        .join(':');
}

// Format duration in human-readable format
export function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

// Format date for display
export function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format date for input fields (YYYY-MM-DD)
export function formatDateForInput(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

// Format time for input fields (HH:MM)
export function formatTimeForInput(date) {
    const d = new Date(date);
    return d.toTimeString().slice(0, 5);
}

// Check if two dates are the same day
export function isSameDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

// Get start of day (midnight)
export function getStartOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Get end of day (23:59:59)
export function getEndOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

// Check if date is today
export function isToday(date) {
    return isSameDay(date, new Date());
}

// Get total seconds between two dates
export function getSecondsBetween(startDate, endDate) {
    return Math.floor((new Date(endDate) - new Date(startDate)) / 1000);
}

// Normalize date to compare dates without time
export function normalizeDate(date) {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

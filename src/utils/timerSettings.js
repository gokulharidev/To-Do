// Timer settings utilities for managing user preferences

const SETTINGS_KEY = 'timetracker_settings';

const DEFAULT_SETTINGS = {
    flowBreakPercent: 20  // Default 20%, range 1-50
};

/**
 * Get all timer settings
 * @returns {Object} Settings object
 */
export function getTimerSettings() {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
        return { ...DEFAULT_SETTINGS };
    }

    try {
        const settings = JSON.parse(data);
        return { ...DEFAULT_SETTINGS, ...settings };
    } catch (e) {
        console.error('Failed to parse timer settings:', e);
        return { ...DEFAULT_SETTINGS };
    }
}

/**
 * Update Flow break percentage
 * @param {number} percent - Break percentage (1-50)
 * @returns {Object} Updated settings
 */
export function updateFlowBreakPercent(percent) {
    // Validate range
    const validPercent = Math.max(1, Math.min(50, percent));

    const settings = getTimerSettings();
    settings.flowBreakPercent = validPercent;

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return settings;
}

/**
 * Get current Flow break percentage
 * @returns {number} Break percentage
 */
export function getFlowBreakPercent() {
    const settings = getTimerSettings();
    return settings.flowBreakPercent;
}

/**
 * Reset settings to defaults
 */
export function resetTimerSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return { ...DEFAULT_SETTINGS };
}

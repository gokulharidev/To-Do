// Timer calculation logic for Traditional and Enhanced Flow modes

export const TIMER_MODES = {
    TRADITIONAL: 'traditional',
    FLOW: 'flow'
};

export const TIMER_STATES = {
    IDLE: 'idle',
    RUNNING: 'running',
    BREAK: 'break',
    PAUSED: 'paused'
};

// Traditional Mode constants
export const TRADITIONAL_WORK_DURATION = 25 * 60; // 25 minutes in seconds
export const TRADITIONAL_BREAK_DURATION = 5 * 60; // 5 minutes in seconds

// Flow Mode constants
export const FLOW_BREAK_RATIO = 5; // 5:1 ratio (work to break)
export const FLOW_MIN_BREAK = 5 * 60; // Minimum 5 minutes
export const FLOW_MAX_BREAK = 20 * 60; // Maximum 20 minutes

/**
 * Calculate break duration for Flow mode based on work duration
 * @param {number} workSeconds - Duration of work session in seconds
 * @returns {number} Break duration in seconds
 */
export function calculateFlowBreak(workSeconds) {
    const breakDuration = Math.floor(workSeconds / FLOW_BREAK_RATIO);
    return Math.max(FLOW_MIN_BREAK, Math.min(breakDuration, FLOW_MAX_BREAK));
}

/**
 * Format seconds into HH:MM:SS or MM:SS
 * @param {number} seconds
 * @returns {string}
 */
export function formatTimerDisplay(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Create a timer session data object
 * @param {Object} params
 * @returns {Object} Session data
 */
export function createSession({
    taskName = '',
    mode = TIMER_MODES.TRADITIONAL,
    workDuration = 0,
    breaksTaken = 0,
    startTime = null,
    endTime = null,
    category = 'Work', // Default category
    description = '',          // new – optional description
    customFields = [],         // new – array of { id, value }
    workItemAttributes = []    // new – array of { id, value }
}) {
    return {
        id: crypto.randomUUID(),
        taskName,
        mode,
        category,
        workDuration,
        breaksTaken,
        description,
        customFields,
        workItemAttributes,
        startTime: startTime || new Date().toISOString(),
        endTime: endTime || new Date().toISOString(),
        createdAt: new Date().toISOString()
    };
}

/**
 * Calculate remaining time for Traditional mode
 * @param {number} elapsed - Elapsed seconds
 * @returns {number} Remaining seconds
 */
export function getTraditionalRemaining(elapsed) {
    return Math.max(0, TRADITIONAL_WORK_DURATION - elapsed);
}

/**
 * Check if Traditional mode work session is complete
 * @param {number} elapsed - Elapsed seconds
 * @returns {boolean}
 */
export function isTraditionalWorkComplete(elapsed) {
    return elapsed >= TRADITIONAL_WORK_DURATION;
}

/**
 * Check if break is complete
 * @param {number} elapsed - Elapsed break seconds
 * @param {number} breakDuration - Total break duration
 * @returns {boolean}
 */
export function isBreakComplete(elapsed, breakDuration) {
    return elapsed >= breakDuration;
}

/**
 * Get break duration based on mode
 * @param {string} mode - Timer mode
 * @param {number} workDuration - Work duration in seconds (for Flow mode)
 * @param {number} flowBreakPercent - Break percentage for Flow mode (1-50, default 20)
 * @returns {number} Break duration in seconds
 */
export function getBreakDuration(mode, workDuration = 0, flowBreakPercent = 20) {
    if (mode === TIMER_MODES.TRADITIONAL) {
        return TRADITIONAL_BREAK_DURATION;
    }

    // Calculate break based on custom percentage
    const breakTime = Math.floor((workDuration * flowBreakPercent) / 100);
    return Math.max(FLOW_MIN_BREAK, Math.min(breakTime, FLOW_MAX_BREAK));
}

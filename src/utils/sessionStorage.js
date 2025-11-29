// Session logs storage for timer sessions

const STORAGE_KEY = 'timetracker_sessions';

/**
 * Get all timer sessions
 * @returns {Array} Array of session objects
 */
export function getAllSessions() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * Add a new session
 * @param {Object} session - Session object
 * @returns {Object} Added session
 */
export function addSession(session) {
    const sessions = getAllSessions();
    sessions.unshift(session); // Add to beginning (newest first)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    return session;
}

/**
 * Get sessions for a specific date
 * @param {Date} date
 * @returns {Array} Sessions for that date
 */
export function getSessionsByDate(date) {
    const sessions = getAllSessions();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === targetDate.getTime();
    });
}

/**
 * Get sessions for today
 * @returns {Array} Today's sessions
 */
export function getTodaySessions() {
    return getSessionsByDate(new Date());
}

/**
 * Get sessions for the current week
 * @returns {Array} This week's sessions
 */
export function getWeekSessions() {
    const sessions = getAllSessions();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= weekAgo;
    });
}

/**
 * Update a session
 * @param {string} sessionId
 * @param {Object} updates
 * @returns {Object} Updated session
 */
export function updateSession(sessionId, updates) {
    const sessions = getAllSessions();
    const index = sessions.findIndex(s => s.id === sessionId);

    if (index === -1) {
        throw new Error('Session not found');
    }

    sessions[index] = { ...sessions[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    return sessions[index];
}

/**
 * Delete a session
 * @param {string} sessionId
 * @returns {boolean} Success
 */
export function deleteSession(sessionId) {
    const sessions = getAllSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
}

/**
 * Clear all sessions
 */
export function clearAllSessions() {
    localStorage.removeItem(STORAGE_KEY);
}

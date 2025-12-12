import {
    getAllSessions,
    addSession,
    getSessionsByDate,
    getTodaySessions,
    getWeekSessions,
    updateSession,
    deleteSession,
    clearAllSessions
} from '../utils/sessionStorage.js';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => { store[key] = value; }),
        removeItem: jest.fn((key) => { delete store[key]; }),
        clear: jest.fn(() => { store = {}; })
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SessionStorage Utility', () => {
    beforeEach(() => {
        localStorageMock.clear();
        jest.clearAllMocks();
    });

    describe('getAllSessions', () => {
        test('returns empty array when no sessions exist', () => {
            expect(getAllSessions()).toEqual([]);
        });

        test('returns stored sessions', () => {
            const sessions = [{ id: '1', taskName: 'Test' }];
            localStorageMock.setItem('timetracker_sessions', JSON.stringify(sessions));
            expect(getAllSessions()).toEqual(sessions);
        });
    });

    describe('addSession', () => {
        test('adds session to beginning of list', () => {
            const session1 = { id: '1', taskName: 'First' };
            const session2 = { id: '2', taskName: 'Second' };

            addSession(session1);
            addSession(session2);

            const sessions = getAllSessions();
            expect(sessions[0].id).toBe('2');
            expect(sessions[1].id).toBe('1');
        });

        test('returns added session', () => {
            const session = { id: '1', taskName: 'Test' };
            const result = addSession(session);
            expect(result).toEqual(session);
        });
    });

    describe('getSessionsByDate', () => {
        test('filters sessions by date', () => {
            const today = new Date();
            const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

            addSession({ id: '1', startTime: today.toISOString() });
            addSession({ id: '2', startTime: yesterday.toISOString() });

            const todaySessions = getSessionsByDate(today);
            expect(todaySessions).toHaveLength(1);
            expect(todaySessions[0].id).toBe('1');
        });
    });

    describe('getTodaySessions', () => {
        test('returns only today\'s sessions', () => {
            const today = new Date();
            addSession({ id: '1', startTime: today.toISOString() });

            const result = getTodaySessions();
            expect(result).toHaveLength(1);
        });
    });

    describe('getWeekSessions', () => {
        test('returns sessions from last 7 days', () => {
            const today = new Date();
            const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
            const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

            addSession({ id: '1', startTime: today.toISOString() });
            addSession({ id: '2', startTime: weekAgo.toISOString() });
            addSession({ id: '3', startTime: twoWeeksAgo.toISOString() });

            const weekSessions = getWeekSessions();
            expect(weekSessions).toHaveLength(2);
        });
    });

    describe('updateSession', () => {
        test('updates existing session', () => {
            addSession({ id: '1', taskName: 'Original' });

            const updated = updateSession('1', { taskName: 'Updated' });
            expect(updated.taskName).toBe('Updated');
        });

        test('throws error for non-existent session', () => {
            expect(() => updateSession('nonexistent', {})).toThrow('Session not found');
        });
    });

    describe('deleteSession', () => {
        test('removes session from storage', () => {
            addSession({ id: '1', taskName: 'Test' });
            addSession({ id: '2', taskName: 'Keep' });

            deleteSession('1');

            const sessions = getAllSessions();
            expect(sessions).toHaveLength(1);
            expect(sessions[0].id).toBe('2');
        });
    });

    describe('clearAllSessions', () => {
        test('removes all sessions', () => {
            addSession({ id: '1' });
            addSession({ id: '2' });

            clearAllSessions();

            expect(getAllSessions()).toEqual([]);
        });
    });
});

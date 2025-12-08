import { SmartTimer } from '../components/smartTimer.js';
import { TIMER_STATES, TIMER_MODES, createSession } from '../utils/timerLogic.js';

// Mock dependencies
jest.mock('../utils/timerLogic.js', () => ({
    TIMER_STATES: { IDLE: 'idle', RUNNING: 'running', PAUSED: 'paused', BREAK: 'break' },
    TIMER_MODES: { TRADITIONAL: 'traditional', FLOW: 'flow' },
    formatTimerDisplay: jest.fn((s) => `00:00:${s.toString().padStart(2, '0')}`),
    getTraditionalRemaining: jest.fn(() => 1500),
    isTraditionalWorkComplete: jest.fn(() => false),
    getBreakDuration: jest.fn(() => 300),
    startBackgroundTimer: jest.fn((cb) => {
        // Mock worker that sends a tick immediately
        cb(1);
        return { terminate: jest.fn() };
    }),
    stopBackgroundTimer: jest.fn(),
    createSession: jest.fn((data) => ({ ...data, id: 'mock-session-id' }))
}));

jest.mock('../utils/sessionStorage.js', () => ({
    addSession: jest.fn(),
    updateSession: jest.fn()
}));

jest.mock('../services/youtrack.js', () => ({
    youtrackService: {
        isAuthenticated: jest.fn(() => false)
    }
}));

describe('SmartTimer Integration', () => {
    let container;
    let smartTimer;

    beforeEach(() => {
        container = document.createElement('div');
        smartTimer = new SmartTimer(container, jest.fn(), jest.fn());
        // Mock alert
        window.alert = jest.fn();
    });

    test('initializes in IDLE state', () => {
        expect(smartTimer.state).toBe(TIMER_STATES.IDLE);
        expect(smartTimer.mode).toBe(TIMER_MODES.TRADITIONAL);
    });

    test('starts timer when task name is provided', () => {
        smartTimer.taskName = 'Test Task';
        smartTimer.start();

        expect(smartTimer.state).toBe(TIMER_STATES.RUNNING);
        expect(container.querySelector('.timer-display')).toBeTruthy();
    });

    test('prevents start without task name', () => {
        smartTimer.taskName = '';
        smartTimer.start();

        expect(smartTimer.state).toBe(TIMER_STATES.IDLE);
        expect(window.alert).toHaveBeenCalled();
    });

    test('stops timer and creates session', () => {
        smartTimer.taskName = 'Test Task';
        smartTimer.start();
        smartTimer.stop();

        expect(smartTimer.state).toBe(TIMER_STATES.IDLE);
        // Verify session creation logic was called (mocked)
        expect(createSession).toHaveBeenCalled();
    });

    test('pauses and resumes timer', () => {
        smartTimer.taskName = 'Test Task';
        smartTimer.start();
        smartTimer.pause();
        expect(smartTimer.state).toBe(TIMER_STATES.PAUSED);

        smartTimer.resume();
        expect(smartTimer.state).toBe(TIMER_STATES.RUNNING);
    });
});

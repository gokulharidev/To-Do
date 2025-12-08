import {
    formatTimerDisplay,
    calculateFlowBreak,
    TIMER_MODES,
    getTraditionalRemaining,
    isTraditionalWorkComplete,
    createSession
} from '../utils/timerLogic.js';

describe('Timer Logic', () => {
    describe('formatTimerDisplay', () => {
        test('formats seconds to HH:MM:SS', () => {
            expect(formatTimerDisplay(0)).toBe('00:00:00');
            expect(formatTimerDisplay(59)).toBe('00:00:59');
            expect(formatTimerDisplay(60)).toBe('00:01:00');
            expect(formatTimerDisplay(3599)).toBe('00:59:59');
            expect(formatTimerDisplay(3600)).toBe('01:00:00');
            expect(formatTimerDisplay(3661)).toBe('01:01:01');
            expect(formatTimerDisplay(86399)).toBe('23:59:59');
        });
    });

    describe('calculateFlowBreak', () => {
        test('calculates break based on 5:1 ratio', () => {
            // 25 mins work -> 5 mins break
            expect(calculateFlowBreak(25 * 60)).toBe(5 * 60);
            // 50 mins work -> 10 mins break
            expect(calculateFlowBreak(50 * 60)).toBe(10 * 60);
        });

        test('enforces minimum break duration', () => {
            // 1 min work -> should be min 5 mins break
            expect(calculateFlowBreak(60)).toBe(5 * 60);
        });

        test('enforces maximum break duration', () => {
            // 5 hours work -> should be max 20 mins break
            expect(calculateFlowBreak(5 * 60 * 60)).toBe(20 * 60);
        });
    });

    describe('Traditional Mode', () => {
        test('calculates remaining time correctly', () => {
            expect(getTraditionalRemaining(0)).toBe(25 * 60);
            expect(getTraditionalRemaining(60)).toBe(24 * 60);
            expect(getTraditionalRemaining(25 * 60)).toBe(0);
            expect(getTraditionalRemaining(26 * 60)).toBe(0);
        });

        test('detects work completion', () => {
            expect(isTraditionalWorkComplete(0)).toBe(false);
            expect(isTraditionalWorkComplete(24 * 60 + 59)).toBe(false);
            expect(isTraditionalWorkComplete(25 * 60)).toBe(true);
            expect(isTraditionalWorkComplete(26 * 60)).toBe(true);
        });
    });

    describe('createSession', () => {
        test('creates session with correct structure', () => {
            const session = createSession({
                taskName: 'Test Task',
                mode: TIMER_MODES.FLOW,
                workDuration: 3600
            });

            expect(session).toHaveProperty('id');
            expect(session.taskName).toBe('Test Task');
            expect(session.mode).toBe(TIMER_MODES.FLOW);
            expect(session.workDuration).toBe(3600);
            expect(session.startTime).toBeDefined();
            expect(session.endTime).toBeDefined();
        });
    });
});

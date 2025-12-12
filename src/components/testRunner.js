// Functional Test Runner Component
// Embeds directly into the app to test live UI

export class FunctionalTestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.isOpen = false;
        this.overlay = null;
    }

    // Register test suites
    init() {
        this.registerTests();
    }

    registerTests() {
        // UI Rendering Tests
        this.describe('UI Rendering', [
            { name: 'App container exists', fn: () => this.assert(document.querySelector('#app'), 'App container not found') },
            { name: 'Timer card renders', fn: () => this.assert(document.querySelector('.smart-timer-card'), 'Timer card not found') },
            {
                name: 'Timer display shows time', fn: () => {
                    const display = document.querySelector('.timer-display');
                    this.assert(display, 'Timer display not found');
                    this.assert(display.textContent.includes(':'), 'Timer does not show time format');
                }
            },
            { name: 'Mode switcher exists', fn: () => this.assert(document.querySelectorAll('.mode-btn').length >= 2, 'Mode buttons not found') },
            { name: 'Start button exists', fn: () => this.assert(document.querySelector('#start-timer-btn'), 'Start button not found') },
            { name: 'Task input exists', fn: () => this.assert(document.querySelector('#timer-task-name'), 'Task input not found') },
            { name: 'Description textarea exists', fn: () => this.assert(document.querySelector('#timer-description'), 'Description textarea not found') },
            { name: 'Type dropdown exists', fn: () => this.assert(document.querySelector('#timer-type'), 'Type dropdown not found') }
        ]);

        // Timer Functionality Tests
        this.describe('Timer Functionality', [
            {
                name: 'Empty task shows alert', fn: async () => {
                    const input = document.querySelector('#timer-task-name');
                    const startBtn = document.querySelector('#start-timer-btn');
                    if (!startBtn) return; // Timer might be running

                    const originalValue = input.value;
                    input.value = '';
                    input.dispatchEvent(new Event('input', { bubbles: true }));

                    let alertCalled = false;
                    const originalAlert = window.alert;
                    window.alert = () => { alertCalled = true; };

                    startBtn.click();
                    await this.delay(100);

                    window.alert = originalAlert;
                    input.value = originalValue;
                    this.assert(alertCalled, 'Alert should be shown for empty task');
                }
            },
            {
                name: 'Timer starts with task', fn: async () => {
                    const input = document.querySelector('#timer-task-name');
                    const startBtn = document.querySelector('#start-timer-btn');
                    if (!startBtn) return; // Already running

                    input.value = 'TEST-001 Functional test';
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    startBtn.click();

                    await this.delay(300);
                    this.assert(document.querySelector('#stop-timer-btn'), 'Stop button should appear');
                }
            },
            {
                name: 'Timer can be paused', fn: async () => {
                    const pauseBtn = document.querySelector('#pause-timer-btn');
                    if (!pauseBtn) throw new Error('Timer not running');

                    pauseBtn.click();
                    await this.delay(200);
                    this.assert(document.querySelector('#resume-timer-btn'), 'Resume button should appear');
                }
            },
            {
                name: 'Timer can be resumed', fn: async () => {
                    const resumeBtn = document.querySelector('#resume-timer-btn');
                    if (!resumeBtn) throw new Error('Timer not paused');

                    resumeBtn.click();
                    await this.delay(200);
                    this.assert(document.querySelector('#pause-timer-btn'), 'Pause button should appear');
                }
            },
            {
                name: 'Timer can be stopped', fn: async () => {
                    const stopBtn = document.querySelector('#stop-timer-btn');
                    if (!stopBtn) throw new Error('Timer not running');

                    stopBtn.click();
                    await this.delay(500);
                    this.assert(document.querySelector('#start-timer-btn'), 'Start button should appear');
                }
            }
        ]);

        // Mode Switching Tests
        this.describe('Mode Switching', [
            {
                name: 'Switch to Flow mode', fn: async () => {
                    const flowBtn = document.querySelector('.mode-btn[data-mode="flow"]');
                    flowBtn.click();
                    await this.delay(200);
                    this.assert(flowBtn.classList.contains('active'), 'Flow button should be active');
                }
            },
            {
                name: 'Switch to Traditional mode', fn: async () => {
                    const tradBtn = document.querySelector('.mode-btn[data-mode="traditional"]');
                    tradBtn.click();
                    await this.delay(200);
                    this.assert(tradBtn.classList.contains('active'), 'Traditional button should be active');
                }
            }
        ]);

        // Session Logs Tests
        this.describe('Session Logs', [
            {
                name: 'View Timesheet button exists', fn: () => {
                    this.assert(document.querySelector('#open-logs-btn'), 'View Timesheet button not found');
                }
            },
            {
                name: 'Logs modal opens', fn: async () => {
                    const logsBtn = document.querySelector('#open-logs-btn');
                    logsBtn.click();
                    await this.delay(300);
                    this.assert(document.querySelector('.session-logs-modal'), 'Logs modal should open');
                }
            },
            {
                name: 'Logs has date navigation', fn: () => {
                    this.assert(document.querySelector('#logs-prev-day'), 'Previous day button not found');
                    this.assert(document.querySelector('#logs-next-day'), 'Next day button not found');
                    this.assert(document.querySelector('#logs-date-display'), 'Date display not found');
                }
            },
            {
                name: 'Logs modal closes', fn: async () => {
                    const closeBtn = document.querySelector('#logs-close-btn');
                    if (closeBtn) {
                        closeBtn.click();
                        await this.delay(300);
                    }
                    this.assert(!document.querySelector('.session-logs-modal'), 'Logs modal should be closed');
                }
            }
        ]);
    }

    describe(suiteName, tests) {
        this.tests.push({ suiteName, tests });
    }

    assert(condition, message = 'Assertion failed') {
        if (!condition) throw new Error(message);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async runAll() {
        this.passed = 0;
        this.failed = 0;
        const resultsDiv = this.overlay.querySelector('#test-results');
        resultsDiv.innerHTML = '';

        for (const suite of this.tests) {
            const suiteDiv = document.createElement('div');
            suiteDiv.className = 'test-suite';
            suiteDiv.innerHTML = `<h3>📋 ${suite.suiteName}</h3>`;

            for (const test of suite.tests) {
                const testDiv = document.createElement('div');
                testDiv.className = 'test-case running';
                testDiv.innerHTML = `<span>${test.name}</span><span class="status">⏳</span>`;
                suiteDiv.appendChild(testDiv);
                resultsDiv.appendChild(suiteDiv);

                try {
                    await test.fn();
                    testDiv.className = 'test-case passed';
                    testDiv.querySelector('.status').textContent = '✓ PASS';
                    testDiv.querySelector('.status').style.color = '#10b981';
                    this.passed++;
                } catch (error) {
                    testDiv.className = 'test-case failed';
                    testDiv.querySelector('.status').textContent = `✗ ${error.message}`;
                    testDiv.querySelector('.status').style.color = '#ef4444';
                    this.failed++;
                }

                await this.delay(50);
            }
        }

        this.updateSummary();
    }

    updateSummary() {
        const summaryDiv = this.overlay.querySelector('#test-summary');
        const total = this.passed + this.failed;
        const allPassed = this.failed === 0;

        summaryDiv.innerHTML = `
            <div style="padding: 15px; background: ${allPassed ? '#0d3320' : '#3d1a1a'}; border-radius: 8px; margin-top: 15px;">
                ${allPassed ? '🎉' : '⚠️'} <strong>${this.passed}/${total}</strong> tests passed
                ${this.failed > 0 ? `, <strong style="color:#ef4444">${this.failed}</strong> failed` : ''}
            </div>
        `;
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;

        this.overlay = document.createElement('div');
        this.overlay.className = 'test-runner-overlay';
        this.overlay.innerHTML = `
            <div class="test-runner-modal">
                <div class="test-runner-header">
                    <h2>🧪 Functional Tests</h2>
                    <button id="close-tests-btn" class="icon-btn">✕</button>
                </div>
                <button id="run-tests-btn" class="run-btn">▶ Run All Tests</button>
                <div id="test-results"></div>
                <div id="test-summary"></div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .test-runner-overlay {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.8); z-index: 9999;
                display: flex; align-items: center; justify-content: center;
            }
            .test-runner-modal {
                background: #141414; border-radius: 16px; padding: 24px;
                max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;
            }
            .test-runner-header {
                display: flex; justify-content: space-between; align-items: center;
                margin-bottom: 16px;
            }
            .test-runner-header h2 { margin: 0; color: #7c3aed; }
            .run-btn {
                width: 100%; padding: 12px; background: #7c3aed; color: white;
                border: none; border-radius: 8px; font-size: 16px; cursor: pointer;
                margin-bottom: 16px;
            }
            .run-btn:hover { background: #6d28d9; }
            .run-btn:disabled { background: #555; cursor: not-allowed; }
            .test-suite { margin-bottom: 16px; }
            .test-suite h3 { font-size: 14px; margin-bottom: 8px; color: #a3a3a3; }
            .test-case {
                display: flex; justify-content: space-between; padding: 8px 12px;
                margin: 4px 0; border-radius: 6px; font-size: 14px;
            }
            .test-case.running { background: #1e3a5f; }
            .test-case.passed { background: #0d3320; }
            .test-case.failed { background: #3d1a1a; }
            .status { font-weight: bold; }
            #close-tests-btn {
                background: transparent; border: none; color: #a3a3a3;
                font-size: 20px; cursor: pointer;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(this.overlay);

        // Attach events
        this.overlay.querySelector('#close-tests-btn').addEventListener('click', () => this.close());
        this.overlay.querySelector('#run-tests-btn').addEventListener('click', async (e) => {
            e.target.disabled = true;
            e.target.textContent = '⏳ Running...';
            await this.runAll();
            e.target.disabled = false;
            e.target.textContent = '▶ Run All Tests';
        });

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    }
}

// Create singleton
export const testRunner = new FunctionalTestRunner();
testRunner.init();

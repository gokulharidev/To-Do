// Break Mode Enforcement Service
// Full-screen overlay that locks the app during breaks

class BreakModeService {
    constructor() {
        this.isActive = false;
        this.breakDuration = 0;
        this.remainingSeconds = 0;
        this.interval = null;
        this.onComplete = null;
        this.onSkip = null;
        this.overlay = null;
    }

    /**
     * Activate break mode
     * @param {number} durationSeconds - Break duration in seconds
     * @param {Function} onComplete - Callback when break completes
     * @param {Function} onSkip - Callback when break is skipped
     */
    activate(durationSeconds, onComplete, onSkip) {
        if (this.isActive) return;

        this.isActive = true;
        this.breakDuration = durationSeconds;
        this.remainingSeconds = durationSeconds;
        this.onComplete = onComplete;
        this.onSkip = onSkip;

        this.createOverlay();
        this.startCountdown();
    }

    createOverlay() {
        // Create full-screen overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'break-overlay';
        this.overlay.innerHTML = `
      <div class="break-content">
        <h2>Break Time</h2>
        <div class="break-timer" id="break-timer-display">--:--</div>
        <p class="break-message">Take a moment to rest and recharge</p>
        <button class="btn btn-secondary squircle" id="skip-break-btn">Skip Break</button>
      </div>
    `;

        document.body.appendChild(this.overlay);

        // Attach skip button event
        const skipBtn = this.overlay.querySelector('#skip-break-btn');
        skipBtn.addEventListener('click', () => this.handleSkipRequest());

        // Disable keyboard shortcuts
        this.disableEscapeHatches();

        // Update display
        this.updateDisplay();
    }

    disableEscapeHatches() {
        // Block common escape keys during break
        this.keyHandler = (e) => {
            // Block Escape, Ctrl+W, Ctrl+Tab, etc.
            if (e.key === 'Escape' ||
                (e.ctrlKey && (e.key === 'w' || e.key === 'Tab')) ||
                e.key === 'F5') {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        window.addEventListener('keydown', this.keyHandler, true);
    }

    startCountdown() {
        this.interval = setInterval(() => {
            this.remainingSeconds--;
            this.updateDisplay();

            if (this.remainingSeconds <= 0) {
                this.complete();
            }
        }, 1000);
    }

    updateDisplay() {
        const display = document.getElementById('break-timer-display');
        if (display) {
            const minutes = Math.floor(this.remainingSeconds / 60);
            const seconds = this.remainingSeconds % 60;
            display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    handleSkipRequest() {
        // Double confirmation required
        const confirmed = confirm('Are you sure you want to skip this break?');
        if (confirmed) {
            const doubleConfirmed = confirm('Skipping breaks can lead to burnout. Are you really sure?');
            if (doubleConfirmed) {
                this.skip();
            }
        }
    }

    skip() {
        this.cleanup();
        if (this.onSkip) {
            this.onSkip();
        }
    }

    complete() {
        this.cleanup();
        if (this.onComplete) {
            this.onComplete();
        }
    }

    cleanup() {
        // Clear interval
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        // Remove overlay
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }

        // Re-enable keyboard
        if (this.keyHandler) {
            window.removeEventListener('keydown', this.keyHandler, true);
            this.keyHandler = null;
        }

        this.isActive = false;
    }
}

// Export singleton instance
export const breakMode = new BreakModeService();

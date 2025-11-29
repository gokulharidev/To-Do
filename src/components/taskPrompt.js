// Task Prompt Component for scheduled task notifications

export class TaskPrompt {
    constructor(onStart, onDismiss) {
        this.onStart = onStart;
        this.onDismiss = onDismiss;
        this.isOpen = false;
        this.overlay = null;
        this.task = null;
        this.autoDismissTimer = null;
    }

    show(task) {
        if (this.isOpen) return;

        this.task = task;
        this.isOpen = true;
        this.render();
        this.attachEvents();

        // Auto-dismiss after 2 minutes if no action
        this.autoDismissTimer = setTimeout(() => {
            this.handleDismiss();
        }, 120000);
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }

        if (this.autoDismissTimer) {
            clearTimeout(this.autoDismissTimer);
            this.autoDismissTimer = null;
        }
    }

    render() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay task-prompt-overlay';
        this.overlay.innerHTML = `
      <div class="modal task-prompt squircle">
        <div class="task-prompt-icon">⏰</div>
        <h2>Scheduled Task</h2>
        <div class="task-prompt-content">
          <p class="task-prompt-title">"${this.task.title}"</p>
          <p>It's time for this task. Start the timer now?</p>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-secondary squircle" id="prompt-dismiss">
            No, Later
          </button>
          <button class="btn btn-primary squircle" id="prompt-start">
            Yes, Start Timer
          </button>
        </div>
      </div>
    `;

        document.body.appendChild(this.overlay);
    }

    attachEvents() {
        const startBtn = document.getElementById('prompt-start');
        const dismissBtn = document.getElementById('prompt-dismiss');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.handleStart());
            startBtn.focus(); // Auto-focus start button
        }

        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => this.handleDismiss());
        }

        // Keyboard shortcuts
        this.keyHandler = (e) => {
            if (e.key === 'Enter' || e.key.toLowerCase() === 'y') {
                this.handleStart();
            } else if (e.key === 'Escape' || e.key.toLowerCase() === 'n') {
                this.handleDismiss();
            }
        };
        window.addEventListener('keydown', this.keyHandler);
    }

    handleStart() {
        this.close();

        if (this.keyHandler) {
            window.removeEventListener('keydown', this.keyHandler);
        }

        if (this.onStart) {
            this.onStart(this.task);
        }
    }

    handleDismiss() {
        this.close();

        if (this.keyHandler) {
            window.removeEventListener('keydown', this.keyHandler);
        }

        if (this.onDismiss) {
            this.onDismiss(this.task);
        }
    }
}

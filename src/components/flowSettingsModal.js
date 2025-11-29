// Flow Settings Modal Component

export class FlowSettingsModal {
    constructor(onSave, onCancel) {
        this.onSave = onSave;
        this.onCancel = onCancel;
        this.isOpen = false;
        this.overlay = null;
        this.currentPercent = 20;
    }

    open(currentPercent = 20) {
        if (this.isOpen) return;

        this.isOpen = true;
        this.currentPercent = currentPercent;
        this.render();
        this.attachEvents();

        // Focus on slider
        setTimeout(() => {
            const slider = document.getElementById('flow-break-slider');
            if (slider) slider.focus();
        }, 100);
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    }

    render() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.innerHTML = `
      <div class="modal flow-settings-modal squircle">
        <h2>Flow Mode Settings</h2>
        <div class="modal-content">
          <div class="settings-group">
            <label class="input-label">
              Break Percentage
              <span class="settings-value">${this.currentPercent}%</span>
            </label>
            <input 
              type="range" 
              class="settings-slider" 
              id="flow-break-slider"
              min="1"
              max="50"
              value="${this.currentPercent}"
            />
            <div class="settings-range-labels">
              <span>1%</span>
              <span>50%</span>
            </div>
          </div>
          
          <div class="settings-examples">
            <div class="example-title">Examples at ${this.currentPercent}%:</div>
            <div class="example-item">• 1h work → ${this.calculateBreak(3600)} break</div>
            <div class="example-item">• 2h work → ${this.calculateBreak(7200)} break</div>
            <div class="example-item">• 5h work → ${this.calculateBreak(18000)} break</div>
          </div>
          
          <div class="settings-info text-secondary">
            <small>Minimum: 5 minutes • Maximum: 20 minutes</small>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-secondary squircle" id="flow-settings-cancel">
            Cancel
          </button>
          <button class="btn btn-primary squircle" id="flow-settings-save">
            Save Settings
          </button>
        </div>
      </div>
    `;

        document.body.appendChild(this.overlay);
    }

    calculateBreak(workSeconds) {
        const breakSeconds = Math.floor((workSeconds * this.currentPercent) / 100);
        const limited = Math.max(300, Math.min(breakSeconds, 1200)); // 5-20 min limits
        const minutes = Math.floor(limited / 60);
        return `${minutes}min`;
    }

    attachEvents() {
        const saveBtn = document.getElementById('flow-settings-save');
        const cancelBtn = document.getElementById('flow-settings-cancel');
        const slider = document.getElementById('flow-break-slider');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSave());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.handleCancel());
        }

        if (slider) {
            slider.addEventListener('input', (e) => {
                this.currentPercent = parseInt(e.target.value);
                this.updateDisplay();
            });
        }

        // Close on overlay click
        if (this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.handleCancel();
                }
            });
        }

        // Close on Escape key
        this.escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.handleCancel();
            }
        };
        window.addEventListener('keydown', this.escapeHandler);
    }

    updateDisplay() {
        const valueDisplay = this.overlay.querySelector('.settings-value');
        const exampleTitle = this.overlay.querySelector('.example-title');
        const exampleItems = this.overlay.querySelectorAll('.example-item');

        if (valueDisplay) {
            valueDisplay.textContent = `${this.currentPercent}%`;
        }

        if (exampleTitle) {
            exampleTitle.textContent = `Examples at ${this.currentPercent}%:`;
        }

        if (exampleItems.length === 3) {
            exampleItems[0].textContent = `• 1h work → ${this.calculateBreak(3600)} break`;
            exampleItems[1].textContent = `• 2h work → ${this.calculateBreak(7200)} break`;
            exampleItems[2].textContent = `• 5h work → ${this.calculateBreak(18000)} break`;
        }
    }

    handleSave() {
        this.close();

        // Remove escape handler
        if (this.escapeHandler) {
            window.removeEventListener('keydown', this.escapeHandler);
        }

        if (this.onSave) {
            this.onSave(this.currentPercent);
        }
    }

    handleCancel() {
        this.close();

        // Remove escape handler
        if (this.escapeHandler) {
            window.removeEventListener('keydown', this.escapeHandler);
        }

        if (this.onCancel) {
            this.onCancel();
        }
    }
}

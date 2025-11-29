// Task Modal Component for adding new tasks

export class TaskModal {
    constructor(onSave, onCancel) {
        this.onSave = onSave;
        this.onCancel = onCancel;
        this.isOpen = false;
        this.overlay = null;
    }

    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.render();
        this.attachEvents();

        // Focus on title input
        setTimeout(() => {
            const titleInput = document.getElementById('task-modal-title');
            if (titleInput) titleInput.focus();
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
      <div class="modal task-modal squircle">
        <h2>Add New Task</h2>
        <div class="modal-content">
          <div class="input-group">
            <label class="input-label">Task Title *</label>
            <input 
              type="text" 
              class="input squircle" 
              id="task-modal-title" 
              placeholder="Enter task title..."
              required
            />
          </div>
          
          <div class="input-group">
            <label class="input-label">Due Date</label>
            <input 
              type="date" 
              class="input squircle" 
              id="task-modal-date"
            />
          </div>

          <div class="input-group">
            <label class="input-label">Scheduled Time (Optional)</label>
            <div class="time-picker">
              <input 
                type="time" 
                class="input squircle" 
                id="task-modal-time"
              />
            </div>
          </div>
          
          <div class="checkbox-group">
            <input 
              type="checkbox" 
              id="task-modal-auto-start"
            />
            <label for="task-modal-auto-start">Auto-start timer at scheduled time</label>
          </div>
          
          <div class="checkbox-group">
            <input 
              type="checkbox" 
              id="task-modal-pin"
            />
            <label for="task-modal-pin">Pin to Today</label>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-secondary squircle" id="task-modal-cancel">
            Cancel
          </button>
          <button class="btn btn-primary squircle" id="task-modal-save">
            Save Task
          </button>
        </div>
      </div>
    `;

        document.body.appendChild(this.overlay);
    }

    attachEvents() {
        const saveBtn = document.getElementById('task-modal-save');
        const cancelBtn = document.getElementById('task-modal-cancel');
        const titleInput = document.getElementById('task-modal-title');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSave());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.handleCancel());
        }

        // Save on Enter key
        if (titleInput) {
            titleInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSave();
                }
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

    handleSave() {
        const titleInput = document.getElementById('task-modal-title');
        const dateInput = document.getElementById('task-modal-date');
        const pinCheckbox = document.getElementById('task-modal-pin');
        const timeInput = document.getElementById('task-modal-time');
        const autoStartCheckbox = document.getElementById('task-modal-auto-start');

        const title = titleInput?.value.trim();

        if (!title) {
            alert('Please enter a task title');
            titleInput?.focus();
            return;
        }

        const taskData = {
            title: title,
            dueDate: dateInput?.value || null,
            pinnedToday: pinCheckbox?.checked || false,
            scheduledTime: timeInput?.value || null, // HH:mm from input type="time"
            autoStartTimer: autoStartCheckbox?.checked || false
        };

        this.close();

        // Remove escape handler
        if (this.escapeHandler) {
            window.removeEventListener('keydown', this.escapeHandler);
        }

        if (this.onSave) {
            this.onSave(taskData);
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

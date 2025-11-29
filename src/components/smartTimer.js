// Smart Timer Component with Traditional and Flow modes
import {
  TIMER_MODES,
  TIMER_STATES,
  formatTimerDisplay,
  getTraditionalRemaining,
  isTraditionalWorkComplete,
  getBreakDuration,
  createSession
} from '../utils/timerLogic.js';
import { addSession } from '../utils/sessionStorage.js';
import { breakMode } from '../services/breakMode.js';
import { FlowSettingsModal } from './flowSettingsModal.js';
import { getFlowBreakPercent, updateFlowBreakPercent } from '../utils/timerSettings.js';
import { getAllCategories, addCategory } from '../utils/categoryStorage.js';
import { youtrackService } from '../services/youtrack.js';
import { IssueAutocomplete } from './issueAutocomplete.js';

export class SmartTimer {
  constructor(container, onSessionAdded, onOpenLogs) {
    this.container = container;
    this.onSessionAdded = onSessionAdded;
    this.onOpenLogs = onOpenLogs;
    this.mode = TIMER_MODES.TRADITIONAL;
    this.state = TIMER_STATES.IDLE;
    this.elapsed = 0;
    this.interval = null;
    this.taskName = '';
    this.startTime = null;
    this.workDuration = 0;
    this.breaksTaken = 0;
    this.flowBreakPercent = getFlowBreakPercent();
    this.flowSettingsModal = null;
    this.category = 'Work'; // Default category
    this.categories = getAllCategories();
    this.selectedIssue = null;
    this.issueAutocomplete = null;

    // Helper method to escape HTML
    this.escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    // Helper method to escape HTML
    this.escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    this.render();
    this.attachEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="card smart-timer-card">
        <div class="timer-header">
          <h2>Focus Timer</h2>
          <div class="mode-switcher">
            <button 
              class="mode-btn ${this.mode === TIMER_MODES.TRADITIONAL ? 'active' : ''}" 
              data-mode="${TIMER_MODES.TRADITIONAL}"
            >
              Traditional
            </button>
            <button 
              class="mode-btn ${this.mode === TIMER_MODES.FLOW ? 'active' : ''}" 
              data-mode="${TIMER_MODES.FLOW}"
            >
              Flow
            </button>
          </div>
        </div>

        <div class="timer-display-container">
          <div class="timer-display ${this.state === TIMER_STATES.RUNNING ? 'pulse' : ''}">
            ${this.getDisplayTime()}
          </div>
          <div class="timer-mode-label text-secondary">
            ${this.getModeLabel()}
          </div>
        </div>

        ${this.mode === TIMER_MODES.FLOW && this.state === TIMER_STATES.IDLE ? this.getFlowSettings() : ''}

        <div class="input-group">
          <label class="input-label">Category</label>
          <select class="input squircle" id="timer-category">
            ${this.categories.map(c => `<option value="${c.name}" ${c.name === this.category ? 'selected' : ''}>${c.name}</option>`).join('')}
            <option value="new">+ Create New Category</option>
          </select>
          ${this.selectedIssue && this.selectedIssue.assignee ? `
            <div class="issue-assignee">
              <span class="assignee-label">Assigned to:</span>
              <span class="assignee-name">${this.escapeHtml(this.selectedIssue.assignee)}</span>
            </div>
          ` : ''}
        </div>

        <div class="input-group">
          <label class="input-label">What are you working on?</label>
          <input 
            type="text" 
            class="input squircle" 
            id="timer-task-name" 
            placeholder="${youtrackService.isAuthenticated() ? 'Type issue ID (e.g., PROJ-123) or search...' : 'Task name...'}"
            value="${this.taskName}"
          />
          ${youtrackService.isAuthenticated() ? `
            <small class="text-muted">Start typing to search YouTrack issues</small>
          ` : ''}
        </div>

        <div class="timer-actions">
          ${this.getActionButtons()}
        </div>

        ${this.getSessionInfo()}
      </div>
    `;
  }

  getDisplayTime() {
    if (this.mode === TIMER_MODES.TRADITIONAL) {
      const remaining = getTraditionalRemaining(this.elapsed);
      return formatTimerDisplay(remaining);
    }
    // Flow mode: count up
    return formatTimerDisplay(this.elapsed);
  }

  getModeLabel() {
    if (this.mode === TIMER_MODES.TRADITIONAL) {
      return '25 min focus / 5 min break';
    }
    return 'Work as long as needed';
  }

  getActionButtons() {
    if (this.state === TIMER_STATES.IDLE) {
      return `
        <button class="btn btn-primary squircle" id="start-timer-btn">
          ▶ Start Focus Session
        </button>
        <div class="timer-secondary-actions">
          <button class="btn btn-text squircle-sm" id="open-logs-btn">
            Time Logs 📝
          </button>
        </div>
      `;
    }

    if (this.state === TIMER_STATES.RUNNING) {
      return `
        <button class="btn btn-danger squircle" id="stop-timer-btn">
          ⏹ Stop Session
        </button>
        <button class="btn btn-secondary squircle" id="pause-timer-btn">
          ⏸ Pause
        </button>
      `;
    }

    if (this.state === TIMER_STATES.PAUSED) {
      return `
        <button class="btn btn-primary squircle" id="resume-timer-btn">
          ▶ Resume
        </button>
        <button class="btn btn-secondary squircle" id="cancel-timer-btn">
          ✕ Cancel
        </button>
      `;
    }

    return '';
  }

  getSessionInfo() {
    if (this.state !== TIMER_STATES.IDLE) {
      return `
        <div class="session-info">
          <div class="session-stat">
            <span class="text-muted">Breaks:</span>
            <span>${this.breaksTaken}</span>
          </div>
          <div class="session-stat">
            <span class="text-muted">Total work:</span>
            <span>${formatTimerDisplay(this.workDuration)}</span>
          </div>
        </div>
      `;
    }
    return '';
  }

  getFlowSettings() {
    return `
      <div class="flow-settings">
        <button class="btn btn-secondary squircle" id="flow-settings-btn">
          ⚙️ Settings
        </button>
        <span class="text-secondary">Break: ${this.flowBreakPercent}%</span>
      </div>
    `;
  }

  attachEvents() {
    // Mode switcher
    const modeBtns = this.container.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.state === TIMER_STATES.IDLE) {
          this.switchMode(btn.dataset.mode);
        }
      });
    });

    // Task name input
    const taskInput = this.container.querySelector('#timer-task-name');
    if (taskInput) {
      // Clean up old autocomplete if it exists
      if (this.issueAutocomplete) {
        this.issueAutocomplete.destroy();
        this.issueAutocomplete = null;
      }

      // Initialize issue autocomplete if YouTrack is connected
      if (youtrackService.isAuthenticated()) {
        this.issueAutocomplete = new IssueAutocomplete(taskInput, (issue) => {
          this.selectedIssue = issue;
          this.taskName = taskInput.value;
        });
      }

      taskInput.addEventListener('input', (e) => {
        this.taskName = e.target.value;
        // Clear selected issue if user manually edits
        if (this.selectedIssue && !e.target.value.includes(this.selectedIssue.idReadable)) {
          this.selectedIssue = null;
        }
      });
    }

    // Category select
    const categorySelect = this.container.querySelector('#timer-category');
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        const value = e.target.value;
        if (value === 'new') {
          const newName = prompt('Enter new category name:');
          if (newName && newName.trim()) {
            try {
              addCategory(newName);
              this.categories = getAllCategories();
              this.category = newName.trim();
              this.render();
              this.attachEvents();
            } catch (err) {
              alert(err.message);
              // Reset to previous category
              this.render();
              this.attachEvents();
            }
          } else {
            // Reset to previous category if cancelled
            this.render();
            this.attachEvents();
          }
        } else {
          this.category = value;
        }
      });
    }

    // Start button
    const startBtn = this.container.querySelector('#start-timer-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.start());
    }

    // Stop button
    const stopBtn = this.container.querySelector('#stop-timer-btn');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stop());
    }

    // Pause button
    const pauseBtn = this.container.querySelector('#pause-timer-btn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.pause());
    }

    // Resume button
    const resumeBtn = this.container.querySelector('#resume-timer-btn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => this.resume());
    }

    // Cancel button
    const cancelBtn = this.container.querySelector('#cancel-timer-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.cancel());
    }

    // Flow settings button
    const settingsBtn = this.container.querySelector('#flow-settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openFlowSettings());
    }

    // Open Logs button
    const logsBtn = this.container.querySelector('#open-logs-btn');
    if (logsBtn) {
      logsBtn.addEventListener('click', () => {
        if (this.onOpenLogs) this.onOpenLogs();
      });
    }
  }

  switchMode(newMode) {
    this.mode = newMode;
    this.render();
    this.attachEvents();
  }

  openFlowSettings() {
    if (!this.flowSettingsModal) {
      this.flowSettingsModal = new FlowSettingsModal(
        (percent) => {
          this.flowBreakPercent = percent;
          updateFlowBreakPercent(percent);
          this.render();
          this.attachEvents();
        },
        () => { } // onCancel - do nothing
      );
    }
    this.flowSettingsModal.open(this.flowBreakPercent);
  }

  startTask(taskName) {
    this.taskName = taskName;
    this.render();
    this.attachEvents();
    this.start();
  }

  start() {
    if (!this.taskName.trim()) {
      alert('Please enter a task name before starting.');
      return;
    }

    this.state = TIMER_STATES.RUNNING;
    this.startTime = new Date();
    this.elapsed = 0;
    this.workDuration = 0;
    this.breaksTaken = 0;

    this.render();
    this.attachEvents();

    this.interval = setInterval(() => {
      this.elapsed++;
      this.updateDisplay();

      // Check if Traditional mode work is complete
      if (this.mode === TIMER_MODES.TRADITIONAL && isTraditionalWorkComplete(this.elapsed)) {
        this.triggerBreak();
      }
    }, 1000);
  }

  stop() {
    this.stopTimer();

    // Save session
    const session = createSession({
      taskName: this.taskName,
      mode: this.mode,
      category: this.category,
      workDuration: this.workDuration + this.elapsed,
      breaksTaken: this.breaksTaken,
      startTime: this.startTime.toISOString(),
      endTime: new Date().toISOString()
    });

    addSession(session);

    // Send to YouTrack if configured and issue is selected
    // Uses session's actual start time to ensure correct date in timesheet
    if (youtrackService.isAuthenticated() && this.selectedIssue && session.workDuration > 0) {
      const sessionDate = new Date(session.startTime);
      const dateStr = sessionDate.toLocaleDateString();
      
      youtrackService.addWorkItemFromSession(session, this.selectedIssue.id)
        .then(() => {
          console.log('Work item sent to YouTrack successfully');
          // Show success notification with date
          this.showNotification(`✓ Time logged to ${this.selectedIssue.idReadable} (${dateStr})`, 'success');
        })
        .catch((error) => {
          console.error('Failed to send work item to YouTrack:', error);
          this.showNotification(`Failed to log time: ${error.message}`, 'error');
        });
    } else if (youtrackService.isAuthenticated() && session.workDuration > 0) {
      // Try to extract issue ID from task name
      const match = this.taskName.match(/([A-Z]+-\d+)/i);
      if (match) {
        const issueId = match[1];
        const sessionDate = new Date(session.startTime);
        const dateStr = sessionDate.toLocaleDateString();
        
        youtrackService.addWorkItemFromSession(session, issueId)
          .then(() => {
            console.log('Work item sent to YouTrack successfully');
            this.showNotification(`✓ Time logged to ${issueId} (${dateStr})`, 'success');
          })
          .catch((error) => {
            console.error('Failed to send work item to YouTrack:', error);
            this.showNotification(`Failed to log time: ${error.message}`, 'error');
          });
      }
    }

    // Notify parent of new session for instant refresh
    if (this.onSessionAdded) {
      this.onSessionAdded(session);
    }

    // Determine if break is needed
    if (this.mode === TIMER_MODES.FLOW && this.elapsed > 0) {
      this.triggerBreak();
    } else {
      this.reset();
    }
  }

  pause() {
    this.stopTimer();
    this.state = TIMER_STATES.PAUSED;
    this.render();
    this.attachEvents();
  }

  resume() {
    this.state = TIMER_STATES.RUNNING;
    this.render();
    this.attachEvents();

    this.interval = setInterval(() => {
      this.elapsed++;
      this.updateDisplay();

      if (this.mode === TIMER_MODES.TRADITIONAL && isTraditionalWorkComplete(this.elapsed)) {
        this.triggerBreak();
      }
    }, 1000);
  }

  cancel() {
    this.stopTimer();
    this.reset();
  }

  stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  triggerBreak() {
    this.stopTimer();

    // Add work duration to total
    this.workDuration += this.elapsed;
    this.elapsed = 0;

    const breakDuration = getBreakDuration(this.mode, this.workDuration, this.flowBreakPercent);

    breakMode.activate(
      breakDuration,
      () => this.onBreakComplete(),
      () => this.onBreakSkipped()
    );
  }

  onBreakComplete() {
    this.breaksTaken++;

    // In Traditional mode, restart the work timer
    if (this.mode === TIMER_MODES.TRADITIONAL) {
      this.state = TIMER_STATES.RUNNING;
      this.elapsed = 0;
      this.render();
      this.attachEvents();

      this.interval = setInterval(() => {
        this.elapsed++;
        this.updateDisplay();

        if (isTraditionalWorkComplete(this.elapsed)) {
          this.triggerBreak();
        }
      }, 1000);
    } else {
      // Flow mode: return to idle after break
      this.reset();
    }
  }

  onBreakSkipped() {
    // User skipped the break, return to idle
    this.reset();
  }

  reset() {
    this.state = TIMER_STATES.IDLE;
    this.elapsed = 0;
    this.taskName = '';
    this.workDuration = 0;
    this.breaksTaken = 0;
    this.selectedIssue = null;
    this.render();
    this.attachEvents();
  }

  updateDisplay() {
    const display = this.container.querySelector('.timer-display');
    if (display) {
      display.textContent = this.getDisplayTime();
    }
  }

  showNotification(message, type = 'info') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

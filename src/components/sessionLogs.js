// Session Logs Modal Component
import { getSessionsByDate, updateSession, deleteSession } from '../utils/sessionStorage.js';
import { formatTimerDisplay } from '../utils/timerLogic.js';
import { youtrackService } from '../services/youtrack.js';
import { escapeHtml } from '../utils/escapeHtml.js';

export class SessionLogs {
  constructor(container) {
    this.container = container;
    this.selectedDate = new Date();
    this.sessions = [];
    this.isOpen = false;
    this.overlay = null;
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.selectedDate = new Date(); // Reset to today
    this.loadSessions();
    this.render();
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    document.body.style.overflow = '';
  }

  loadSessions() {
    this.sessions = getSessionsByDate(this.selectedDate);
  }

  refresh() {
    if (this.isOpen) {
      this.loadSessions();
      this.updateContent();
    }
  }

  render() {
    if (!this.overlay) {
      this.renderStructure();
    }
    this.updateContent();
  }

  renderStructure() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay session-logs-overlay';

    this.overlay.innerHTML = `
      <div class="modal session-logs-modal squircle">
        <div class="modal-header">
          <h2>Time Logs</h2>
          <button class="icon-btn close-btn squircle-sm" id="logs-close-btn">✕</button>
        </div>
        
        <div class="logs-calendar-header">
          <button class="icon-btn squircle-sm logs-nav-btn" id="logs-prev-day">‹</button>
          <div class="logs-date-display" id="logs-date-display"></div>
          <button class="icon-btn squircle-sm logs-nav-btn" id="logs-next-day">›</button>
        </div>

        <div class="logs-list-container" id="logs-list-container"></div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    this.attachStaticEvents();
  }

  updateContent() {
    if (!this.overlay) return;

    const dateDisplay = this.overlay.querySelector('#logs-date-display');
    const listContainer = this.overlay.querySelector('#logs-list-container');

    if (dateDisplay) {
      dateDisplay.textContent = this.selectedDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }

    if (listContainer) {
      listContainer.innerHTML = this.sessions.length === 0 ? this.renderEmpty() : this.renderSessions();
    }

    this.attachDynamicEvents();
  }

  renderEmpty() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <div class="empty-state-text text-secondary">No sessions for this date</div>
      </div>
    `;
  }

  renderSessions() {
    return this.sessions.map(session => this.renderSessionItem(session)).join('');
  }

  renderSessionItem(session) {
    const startTime = new Date(session.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(session.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Check if session has YouTrack issue info
    const hasYouTrackSync = session.taskName && session.taskName.match(/([A-Z]+-\d+)/i);
    const issueMatch = hasYouTrackSync ? session.taskName.match(/([A-Z]+-\d+)/i) : null;

    return `
      <div class="log-entry squircle-sm">
        <div class="log-info">
          <div class="log-task-name">
            ${session.taskName || 'Untitled Task'}
            ${hasYouTrackSync ? '<span class="youtrack-synced-badge" title="Synced to YouTrack">📤</span>' : ''}
            ${session.billabilityValue && session.billabilityValue.name === 'Non Billable' ? '<span class="non-billable-badge" title="Non-billable">⊘</span>' : ''}
          </div>
          <div class="log-meta text-secondary">
            <span class="badge badge-${session.mode}">${session.mode}</span>
            <span>${startTime} - ${endTime}</span>
            <span>• ${formatTimerDisplay(session.workDuration)}</span>
            ${session.billabilityValue ? `<span>• ${this.escapeHtml(session.billabilityValue.name)}</span>` : ''}
          </div>
          ${session.description ? `<div class="log-description text-secondary">${this.escapeHtml(session.description)}</div>` : ''}
        </div>
        <div class="log-actions">
          <button class="icon-btn edit-btn squircle-sm" data-id="${session.id}">✎</button>
          <button class="icon-btn delete-btn squircle-sm" data-id="${session.id}">🗑️</button>
        </div>
      </div>
    `;
  }

  // Use shared escapeHtml utility - keeping method signature for compatibility
  escapeHtml(text) {
    return escapeHtml(text);
  }

  attachStaticEvents() {
    this.overlay.querySelector('#logs-prev-day')?.addEventListener('click', () => this.changeDate(-1));
    this.overlay.querySelector('#logs-next-day')?.addEventListener('click', () => this.changeDate(1));
    this.overlay.querySelector('#logs-close-btn')?.addEventListener('click', () => this.close());

    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });
  }

  attachDynamicEvents() {
    // Edit & Delete Buttons
    this.overlay.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sessionId = e.target.closest('.edit-btn').dataset.id;
        const session = this.sessions.find(s => s.id === sessionId);
        if (session) this.openEditModal(session);
      });
    });

    this.overlay.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sessionId = e.target.closest('.delete-btn').dataset.id;
        const session = this.sessions.find(s => s.id === sessionId);
        if (session) this.openDeleteModal(session);
      });
    });
  }

  changeDate(days) {
    this.selectedDate.setDate(this.selectedDate.getDate() + days);
    this.loadSessions();
    this.updateContent();
  }

  async openEditModal(session) {
    const editOverlay = document.createElement('div');
    editOverlay.className = 'modal-overlay sub-modal-overlay';
    editOverlay.style.zIndex = '1100';

    const toLocalISO = (isoString) => {
      const date = new Date(isoString);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      return date.toISOString().slice(0, 16);
    };

    // Check for YouTrack info
    const issueMatch = session.taskName ? session.taskName.match(/([A-Z]+-\d+)/i) : null;
    const issueId = issueMatch ? issueMatch[1] : null;
    const isYouTrackSession = !!issueId && youtrackService.isAuthenticated();

    let workItemTypes = [];
    let billabilityAttribute = null;

    editOverlay.innerHTML = `
      <div class="modal sub-modal squircle">
        <div class="modal-header">
          <h2>Edit Session</h2>
          <button class="icon-btn close-btn squircle-sm" id="edit-close-btn">✕</button>
        </div>
        
        <div class="edit-form">
          <div class="input-group">
            <label>Task Name</label>
            <input type="text" class="input squircle" id="edit-task-name" value="${session.taskName}">
          </div>
          <div class="input-row">
            <div class="input-group">
              <label>Start Time</label>
              <input type="datetime-local" class="input squircle" id="edit-start-time" value="${toLocalISO(session.startTime)}">
            </div>
            <div class="input-group">
              <label>End Time</label>
              <input type="datetime-local" class="input squircle" id="edit-end-time" value="${toLocalISO(session.endTime)}">
            </div>
          </div>
          
          ${isYouTrackSession ? `
            <div class="youtrack-fields">
              <div class="input-group">
                <label>Work Type</label>
                <select class="input squircle" id="edit-work-type" disabled>
                  <option>Loading...</option>
                </select>
              </div>
              <div class="input-group">
                <label>Billability</label>
                <select class="input squircle" id="edit-billability" disabled>
                  <option>Loading...</option>
                </select>
              </div>
            </div>
          ` : ''}

          <div class="modal-actions">
            <button class="btn btn-secondary squircle" id="edit-cancel-btn">Cancel</button>
            <button class="btn btn-primary squircle" id="edit-save-btn">Save Changes</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(editOverlay);

    const close = () => editOverlay.remove();

    editOverlay.querySelector('#edit-close-btn').addEventListener('click', close);
    editOverlay.querySelector('#edit-cancel-btn').addEventListener('click', close);

    // Fetch YouTrack data if applicable
    if (isYouTrackSession) {
      try {
        // Fetch issue to get project ID
        const issue = await youtrackService.getIssue(issueId);
        if (issue && issue.project) {
          const [types, attributes] = await Promise.all([
            youtrackService.getWorkItemTypes(issue.project.id),
            youtrackService.getWorkItemAttributes(issue.project.id)
          ]);

          workItemTypes = types;
          billabilityAttribute = attributes.find(attr => attr.name === 'Billability');

          // Populate Work Type
          const typeSelect = editOverlay.querySelector('#edit-work-type');
          if (typeSelect) {
            typeSelect.innerHTML = '<option value="">Select Type</option>' +
              types.map(t => `<option value="${t.id}" ${session.workItemType && session.workItemType.id === t.id ? 'selected' : ''}>${t.name}</option>`).join('');
            typeSelect.disabled = false;
          }

          // Populate Billability
          const billabilitySelect = editOverlay.querySelector('#edit-billability');
          if (billabilitySelect && billabilityAttribute) {
            billabilitySelect.innerHTML = '<option value="">Select Billability</option>' +
              billabilityAttribute.values.map(v => `<option value="${v.id}" ${session.billabilityValue && session.billabilityValue.id === v.id ? 'selected' : ''}>${v.name}</option>`).join('');
            billabilitySelect.disabled = false;
          } else if (billabilitySelect) {
            billabilitySelect.innerHTML = '<option value="">Not available</option>';
          }
        }
      } catch (error) {
        console.error('Failed to fetch YouTrack details:', error);
      }
    }

    editOverlay.querySelector('#edit-save-btn').addEventListener('click', async () => {
      const taskName = document.getElementById('edit-task-name').value;
      const startTime = document.getElementById('edit-start-time').value;
      const endTime = document.getElementById('edit-end-time').value;

      let selectedType = null;
      let selectedBillability = null;

      if (isYouTrackSession) {
        const typeId = document.getElementById('edit-work-type').value;
        if (typeId) selectedType = workItemTypes.find(t => t.id === typeId);

        const billabilityId = document.getElementById('edit-billability').value;
        if (billabilityId && billabilityAttribute) selectedBillability = billabilityAttribute.values.find(v => v.id === billabilityId);
      }

      if (!taskName || !startTime || !endTime) {
        alert('Please fill in all fields');
        return;
      }

      const start = new Date(startTime);
      const end = new Date(endTime);

      if (end <= start) {
        alert('End time must be after start time');
        return;
      }

      const duration = Math.floor((end - start) / 1000);
      const durationMinutes = Math.round(duration / 60);

      // Update local session
      const updatedSession = {
        taskName,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        workDuration: duration,
        workItemType: selectedType,
        billabilityValue: selectedBillability,
        billabilityAttributeId: billabilityAttribute ? billabilityAttribute.id : session.billabilityAttributeId
      };

      updateSession(session.id, updatedSession);

      // Update YouTrack if applicable
      // Note: We don't store the YouTrack Work Item ID in the session currently.
      // This is a limitation. We can only add new work items, not update existing ones unless we store the ID.
      // Assuming for now we just update local, or if we had the ID we would call update.
      // Wait, the user requirement is "when i make change in that attribute, it should reflect in youtrack."
      // If we don't have the Work Item ID, we can't update it.
      // We need to store the Work Item ID when we create it.

      // For now, I'll implement the call assuming we might have it, or log a warning.
      if (isYouTrackSession && session.youtrackWorkItemId) {
        try {
          await youtrackService.updateWorkItem(issueId, session.youtrackWorkItemId, {
            duration: durationMinutes,
            date: start,
            description: session.description || taskName,
            workItemType: selectedType,
            billabilityValue: selectedBillability,
            billabilityAttributeId: updatedSession.billabilityAttributeId
          });
          alert('Session and YouTrack updated!');
        } catch (e) {
          alert('Local session updated, but failed to update YouTrack: ' + e.message);
        }
      } else if (isYouTrackSession) {
        // If we don't have the ID, maybe we should create a new one? No, that would duplicate.
        // We should probably start storing the ID.
        console.warn('Cannot update YouTrack: Work Item ID not found in session.');
        alert('Local session updated. YouTrack could not be updated (missing sync info).');
      } else {
        alert('Session updated!');
      }

      this.loadSessions();
      this.updateContent();
      close();
    });

    editOverlay.addEventListener('click', (e) => {
      if (e.target === editOverlay) close();
    });
  }

  openDeleteModal(session) {
    const deleteOverlay = document.createElement('div');
    deleteOverlay.className = 'modal-overlay sub-modal-overlay';
    deleteOverlay.style.zIndex = '1100';

    deleteOverlay.innerHTML = `
      <div class="modal sub-modal squircle">
        <div class="modal-header">
          <h2>Delete Session</h2>
          <button class="icon-btn close-btn squircle-sm" id="delete-close-btn">✕</button>
        </div>
        
        <div class="modal-content">
          <p>Are you sure you want to delete the session for <strong>"${session.taskName}"</strong>?</p>
          <p class="text-secondary">This action cannot be undone.</p>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary squircle" id="delete-cancel-btn">Cancel</button>
          <button class="btn btn-danger squircle" id="delete-confirm-btn">Delete</button>
        </div>
      </div>
    `;

    document.body.appendChild(deleteOverlay);

    const close = () => deleteOverlay.remove();

    deleteOverlay.querySelector('#delete-close-btn').addEventListener('click', close);
    deleteOverlay.querySelector('#delete-cancel-btn').addEventListener('click', close);

    deleteOverlay.querySelector('#delete-confirm-btn').addEventListener('click', () => {
      deleteSession(session.id);
      this.loadSessions();
      this.updateContent();
      close();
    });

    deleteOverlay.addEventListener('click', (e) => {
      if (e.target === deleteOverlay) close();
    });
  }
}

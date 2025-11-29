// Today's Tasks Widget - Shows tasks due today
import { getTodayTasks, toggleTaskComplete } from '../utils/taskStorage.js';
import { TaskModal } from './taskModal.js';

export class TodayTasks {
  constructor(container, onTaskAdded) {
    this.container = container;
    this.onTaskAdded = onTaskAdded;
    this.tasks = [];
    this.taskModal = null;
    this.loadTasks();
    this.render();
    this.attachEvents();
  }

  loadTasks() {
    this.tasks = getTodayTasks();
  }

  render() {
    this.container.innerHTML = `
      <div class="card today-tasks-card squircle">
        <h3>Today's Tasks</h3>
        <div class="tasks-list">
          ${this.tasks.length === 0 ? this.renderEmpty() : this.renderTasks()}
        </div>
        <button class="btn btn-secondary squircle mt-sm" id="add-task-btn" style="width: 100%;">
          + Add Task
        </button>
      </div>
    `;
  }

  renderEmpty() {
    return `
      <div class="empty-state">
        <div class="empty-state-text text-secondary">No tasks for today</div>
      </div>
    `;
  }

  renderTasks() {
    return this.tasks.map(task => `
      <div class="task-item">
        <input type="checkbox" ${task.completed ? 'checked' : ''} data-task-id="${task.id}" />
        <span class="${task.completed ? 'completed' : ''}">${task.title}</span>
      </div>
    `).join('');
  }

  attachEvents() {
    // Add Task button
    const addBtn = this.container.querySelector('#add-task-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.openAddTaskModal());
    }

    // Task checkboxes
    const checkboxes = this.container.querySelectorAll('.task-item input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const taskId = e.target.dataset.taskId;
        this.toggleTask(taskId);
      });
    });
  }

  openAddTaskModal() {
    if (!this.taskModal) {
      this.taskModal = new TaskModal(
        (taskData) => this.handleTaskAdded(taskData),
        () => { } // onCancel - do nothing
      );
    }
    this.taskModal.open();
  }

  handleTaskAdded(taskData) {
    // Notify parent that task was added
    if (this.onTaskAdded) {
      this.onTaskAdded(taskData);
    }

    // Refresh the task list
    this.refresh();
  }

  toggleTask(taskId) {
    toggleTaskComplete(taskId);
    this.refresh();
  }

  refresh() {
    this.loadTasks();
    this.render();
    this.attachEvents();
  }
}

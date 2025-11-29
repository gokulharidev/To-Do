// TASKS Page - Task management
export class TasksPage {
    constructor(container) {
        this.container = container;
        this.render();
    }

    show() {
        this.container.classList.remove('hidden');
    }

    hide() {
        this.container.classList.add('hidden');
    }

    render() {
        this.container.innerHTML = `
      <div class="page" id="tasks-page">
        <h1>✅ Tasks</h1>
        <p class="text-secondary">Task manager - Coming soon</p>
      </div>
    `;
    }
}

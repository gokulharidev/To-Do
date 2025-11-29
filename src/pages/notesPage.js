// NOTES Page - Note-taking workspace
export class NotesPage {
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
      <div class="page" id="notes-page">
        <h1>📝 Notes</h1>
        <p class="text-secondary">Note editor - Coming soon</p>
      </div>
    `;
    }
}

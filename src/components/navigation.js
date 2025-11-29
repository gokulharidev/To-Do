// Bottom-left navigation dock component
import { router } from '../router.js';

export class Navigation {
    constructor(container) {
        this.container = container;
        this.pages = [
            { name: 'time', icon: '⏱️', label: 'Time' },
            { name: 'calendar', icon: '📅', label: 'Calendar' }
        ];

        this.render();
        this.attachEvents();

        // Listen to route changes to update active state
        router.onChange((change) => this.updateActiveState(change.to));
    }

    render() {
        this.container.innerHTML = `
      <div class="nav-dock">
        ${this.pages.map((page, index) => `
          <button 
            class="nav-dock-icon squircle ${index === 0 ? 'active' : ''}" 
            data-page="${page.name}"
            title="${page.label}"
            aria-label="Navigate to ${page.label}"
          >
            ${page.icon}
          </button>
        `).join('')}
      </div>
    `;
    }

    attachEvents() {
        const icons = this.container.querySelectorAll('.nav-dock-icon');
        icons.forEach(icon => {
            icon.addEventListener('click', () => {
                const pageName = icon.dataset.page;
                router.navigate(pageName);
            });
        });
    }

    updateActiveState(currentPage) {
        const icons = this.container.querySelectorAll('.nav-dock-icon');
        icons.forEach(icon => {
            if (icon.dataset.page === currentPage) {
                icon.classList.add('active');
            } else {
                icon.classList.remove('active');
            }
        });
    }
}

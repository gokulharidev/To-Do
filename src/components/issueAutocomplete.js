// Issue Autocomplete Component for YouTrack issue selection
import { youtrackService } from '../services/youtrack.js';

// Simple cache for issue search results (query -> issues array)
const issueSearchCache = new Map();

export class IssueAutocomplete {
    constructor(inputElement, onSelect) {
        this.inputElement = inputElement;
        this.onSelect = onSelect;
        this.dropdown = null;
        this.selectedIssue = null;
        this.searchTimeout = null;
        this.isOpen = false;

        this.init();
    }

    init() {
        // Create dropdown container
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'issue-autocomplete-dropdown';
        this.dropdown.style.display = 'none';

        // Insert after input element
        this.inputElement.parentElement.style.position = 'relative';
        this.inputElement.parentElement.appendChild(this.dropdown);

        this.attachEvents();
    }

    attachEvents() {
        // Input events
        this.inputElement.addEventListener('input', (e) => {
            this.handleInput(e.target.value);
        });

        this.inputElement.addEventListener('focus', () => {
            if (this.inputElement.value.length >= 2) {
                this.handleInput(this.inputElement.value);
            }
        });

        this.inputElement.addEventListener('blur', () => {
            // Delay to allow click on dropdown items
            setTimeout(() => {
                this.close();
            }, 200);
        });

        // Keyboard navigation
        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateDown();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateUp();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.selectHighlighted();
            } else if (e.key === 'Escape') {
                this.close();
            }
        });
    }

    async handleInput(query) {
        clearTimeout(this.searchTimeout);

        if (query.length < 2) {
            this.close();
            this.selectedIssue = null;
            return;
        }

        // Check cache first
        if (issueSearchCache.has(query)) {
            this.showResults(issueSearchCache.get(query));
            return;
        }

        // Debounce search
        this.searchTimeout = setTimeout(async () => {
            await this.searchIssues(query);
        }, 300);
    }

    async searchIssues(query) {
        if (!youtrackService.isAuthenticated()) {
            this.showError('YouTrack is not connected');
            return;
        }

        try {
            // Show loading
            this.showLoading();

            // Search issues - try to find by ID first, then by text
            let issues = [];

            // If query looks like an issue ID (e.g., "PROJ-123"), search for it
            if (/^[A-Z]+-\d+$/i.test(query.trim())) {
                try {
                    const issue = await youtrackService.getIssue(query.trim());
                    issues = [{
                        id: issue.id,
                        idReadable: issue.idReadable || issue.id,
                        summary: issue.summary || '',
                        project: issue.project?.name || ''
                    }];
                } catch (error) {
                    // Issue not found, continue with text search
                }
            }

            // If no exact match, do text search
            if (issues.length === 0) {
                issues = await youtrackService.searchIssues(query, 10);
            }

            // Cache the results for this query
            issueSearchCache.set(query, issues);

            this.showResults(issues);
        } catch (error) {
            console.error('Error searching issues:', error);
            this.showError(error.message);
        }
    }

    showLoading() {
        this.dropdown.innerHTML = `
            <div class="issue-autocomplete-item">
                <div class="text-muted">Searching...</div>
            </div>
        `;
        this.dropdown.style.display = 'block';
        this.isOpen = true;
    }

    showError(message) {
        this.dropdown.innerHTML = `
            <div class="issue-autocomplete-item issue-autocomplete-error">
                <div class="text-muted">${message}</div>
            </div>
        `;
        this.dropdown.style.display = 'block';
        this.isOpen = true;
    }

    showResults(issues) {
        if (issues.length === 0) {
            this.dropdown.innerHTML = `
                <div class="issue-autocomplete-item">
                    <div class="text-muted">No issues found</div>
                </div>
            `;
        } else {
            this.dropdown.innerHTML = issues.map((issue, index) => `
                <div 
                    class="issue-autocomplete-item ${index === 0 ? 'highlighted' : ''}" 
                    data-issue-id="${issue.id}"
                    data-issue-readable="${issue.idReadable}"
                    data-issue-summary="${this.escapeHtml(issue.summary)}"
                    data-project-id="${issue.project && issue.project.id ? issue.project.id : ''}"
                >
                    <div class="issue-id">${issue.idReadable}</div>
                    <div class="issue-summary">${this.escapeHtml(issue.summary)}</div>
                    ${issue.project ? `<div class="issue-project">${this.escapeHtml(issue.project)}</div>` : ''}
                </div>
            `).join('');

            // Attach click events
            this.dropdown.querySelectorAll('.issue-autocomplete-item').forEach((item, index) => {
                item.addEventListener('click', () => {
                    this.selectIssue(item);
                });

                item.addEventListener('mouseenter', () => {
                    this.highlightItem(index);
                });
            });
        }

        this.dropdown.style.display = 'block';
        this.isOpen = true;
    }

    selectIssue(itemElement) {
        const issueId = itemElement.dataset.issueId;
        const issueReadable = itemElement.dataset.issueReadable;
        const issueSummary = itemElement.dataset.issueSummary;
        const projectId = itemElement.dataset.projectId;

        this.selectedIssue = {
            id: issueId,
            idReadable: issueReadable,
            summary: issueSummary,
            project: { id: projectId }
        };

        // Update input value
        this.inputElement.value = `${issueReadable}: ${issueSummary}`;

        this.close();

        if (this.onSelect) {
            this.onSelect(this.selectedIssue);
        }
    }

    selectHighlighted() {
        const highlighted = this.dropdown.querySelector('.issue-autocomplete-item.highlighted');
        if (highlighted) {
            this.selectIssue(highlighted);
        }
    }

    navigateDown() {
        const items = this.dropdown.querySelectorAll('.issue-autocomplete-item');
        const current = this.dropdown.querySelector('.issue-autocomplete-item.highlighted');

        if (items.length === 0) return;

        if (!current) {
            items[0].classList.add('highlighted');
        } else {
            const currentIndex = Array.from(items).indexOf(current);
            current.classList.remove('highlighted');
            const nextIndex = (currentIndex + 1) % items.length;
            items[nextIndex].classList.add('highlighted');
        }
    }

    navigateUp() {
        const items = this.dropdown.querySelectorAll('.issue-autocomplete-item');
        const current = this.dropdown.querySelector('.issue-autocomplete-item.highlighted');

        if (items.length === 0) return;

        if (!current) {
            items[items.length - 1].classList.add('highlighted');
        } else {
            const currentIndex = Array.from(items).indexOf(current);
            current.classList.remove('highlighted');
            const prevIndex = (currentIndex - 1 + items.length) % items.length;
            items[prevIndex].classList.add('highlighted');
        }
    }

    highlightItem(index) {
        this.dropdown.querySelectorAll('.issue-autocomplete-item').forEach((item, i) => {
            if (i === index) {
                item.classList.add('highlighted');
            } else {
                item.classList.remove('highlighted');
            }
        });
    }

    close() {
        this.dropdown.style.display = 'none';
        this.isOpen = false;
    }

    getSelectedIssue() {
        return this.selectedIssue;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    destroy() {
        if (this.dropdown) {
            this.dropdown.remove();
        }
        clearTimeout(this.searchTimeout);
    }
}

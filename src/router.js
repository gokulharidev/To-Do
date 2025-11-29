// Client-side router for page navigation

class Router {
    constructor() {
        this.pages = new Map();
        this.currentPage = null;
        this.listeners = [];
    }

    // Register a page
    registerPage(name, pageInstance) {
        this.pages.set(name, pageInstance);
    }

    // Navigate to a page
    navigate(pageName) {
        if (!this.pages.has(pageName)) {
            console.error(`Page "${pageName}" not found`);
            return;
        }

        // Hide current page
        if (this.currentPage) {
            const currentInstance = this.pages.get(this.currentPage);
            if (currentInstance && currentInstance.hide) {
                currentInstance.hide();
            }
        }

        // Show new page
        const newInstance = this.pages.get(pageName);
        if (newInstance && newInstance.show) {
            newInstance.show();
        }

        const previousPage = this.currentPage;
        this.currentPage = pageName;

        // Notify listeners
        this.notifyListeners({ from: previousPage, to: pageName });

        // Update URL (optional, without page reload)
        if (window.history && window.history.pushState) {
            window.history.pushState({ page: pageName }, '', `#${pageName}`);
        }
    }

    // Get current page name
    getCurrentPage() {
        return this.currentPage;
    }

    // Add route change listener
    onChange(callback) {
        this.listeners.push(callback);
    }

    // Notify all listeners
    notifyListeners(routeChange) {
        this.listeners.forEach(listener => listener(routeChange));
    }

    // Initialize with default page
    init(defaultPage = 'time') {
        // Handle browser back/forward
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                this.navigate(event.state.page);
            }
        });

        // Check URL hash on load
        const hash = window.location.hash.slice(1);
        const initialPage = hash && this.pages.has(hash) ? hash : defaultPage;

        this.navigate(initialPage);
    }
}

// Create singleton instance
export const router = new Router();

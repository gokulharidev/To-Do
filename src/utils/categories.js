// Predefined categories with colors
export const CATEGORIES = {
    'Meeting': 'meeting',
    'Focus Work': 'focus',
    'Admin': 'admin',
    'Break': 'break',
    'Meeting Preparation': 'prep',
    'Other': 'other'
};

// Get badge class for category
export function getCategoryClass(category) {
    const normalized = category.toLowerCase();

    if (normalized.includes('meeting prep')) return 'badge-prep';
    if (normalized.includes('meeting')) return 'badge-meeting';
    if (normalized.includes('focus')) return 'badge-focus';
    if (normalized.includes('admin')) return 'badge-admin';
    if (normalized.includes('break')) return 'badge-break';

    return 'badge-other';
}

// Create category badge element
export function createCategoryBadge(category) {
    const badge = document.createElement('span');
    badge.className = `badge ${getCategoryClass(category)}`;
    badge.textContent = category;
    return badge;
}

// Get all unique categories from entries (including custom ones)
export function getAllCategories(entries) {
    const categories = new Set(Object.keys(CATEGORIES));

    entries.forEach(entry => {
        if (entry.category) {
            categories.add(entry.category);
        }
    });

    return Array.from(categories).sort();
}

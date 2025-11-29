// Category storage utilities

const CATEGORY_STORAGE_KEY = 'timetracker_categories';

const DEFAULT_CATEGORIES = [
    { id: 'default-work', name: 'Work', color: '#3b82f6', isDefault: true },
    { id: 'default-study', name: 'Study', color: '#10b981', isDefault: true },
    { id: 'default-personal', name: 'Personal', color: '#f59e0b', isDefault: true },
    { id: 'default-meeting', name: 'Meeting', color: '#8b5cf6', isDefault: true }
];

/**
 * Get all categories
 * @returns {Array} Array of category objects
 */
export function getAllCategories() {
    const data = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!data) {
        // Initialize with defaults if empty
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
        return [...DEFAULT_CATEGORIES];
    }
    return JSON.parse(data);
}

/**
 * Add a new category
 * @param {string} name - Category name
 * @param {string} color - Hex color code (optional)
 * @returns {Object} New category object
 */
export function addCategory(name, color = '#64748b') {
    const categories = getAllCategories();

    // Check for duplicates
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        throw new Error('Category already exists');
    }

    const newCategory = {
        id: crypto.randomUUID(),
        name: name.trim(),
        color,
        isDefault: false
    };

    categories.push(newCategory);
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
    return newCategory;
}

/**
 * Delete a category
 * @param {string} id - Category ID
 * @returns {boolean} Success
 */
export function deleteCategory(id) {
    const categories = getAllCategories();
    const filtered = categories.filter(c => c.id !== id || c.isDefault); // Prevent deleting defaults

    if (filtered.length === categories.length) return false;

    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(filtered));
    return true;
}

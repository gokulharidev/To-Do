import { generateId, normalizeDate } from './utils.js';

const STORAGE_KEY = 'timeTrackingEntries';

// Get all entries from localStorage
export function getAllEntries() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return [];
    }
}

// Save entries to localStorage
function saveEntries(entries) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

// Add new entry
export function addEntry(entry) {
    const entries = getAllEntries();
    const newEntry = {
        id: generateId(),
        ...entry,
        createdAt: new Date().toISOString()
    };

    entries.push(newEntry);
    saveEntries(entries);
    return newEntry;
}

// Get entries for a specific date
export function getEntriesByDate(date) {
    const entries = getAllEntries();
    const targetDate = normalizeDate(date);

    return entries.filter(entry => {
        const entryDate = normalizeDate(new Date(entry.startTime));
        return entryDate.getTime() === targetDate.getTime();
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

// Update entry by ID
export function updateEntry(id, updates) {
    const entries = getAllEntries();
    const index = entries.findIndex(entry => entry.id === id);

    if (index === -1) {
        console.error('Entry not found:', id);
        return null;
    }

    entries[index] = {
        ...entries[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    saveEntries(entries);
    return entries[index];
}

// Delete entry by ID
export function deleteEntry(id) {
    const entries = getAllEntries();
    const filtered = entries.filter(entry => entry.id !== id);

    if (filtered.length === entries.length) {
        console.error('Entry not found:', id);
        return false;
    }

    saveEntries(filtered);
    return true;
}

// Get entry by ID
export function getEntryById(id) {
    const entries = getAllEntries();
    return entries.find(entry => entry.id === id);
}

// Delete all entries (for testing/reset)
export function clearAllEntries() {
    localStorage.removeItem(STORAGE_KEY);
    return true;
}

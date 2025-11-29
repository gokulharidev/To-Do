// Task storage utilities for managing tasks

const STORAGE_KEY = 'timetracker_tasks';

/**
 * Get all tasks
 * @returns {Array} Array of task objects
 */
export function getAllTasks() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * Add a new task
 * @param {Object} task - Task object
 * @returns {Object} Added task
 */
export function addTask(task) {
    const tasks = getAllTasks();
    const newTask = {
        id: crypto.randomUUID(),
        title: task.title,
        completed: false,
        dueDate: task.dueDate || null,
        pinnedToday: task.pinnedToday || false,
        tags: task.tags || [],
        priority: task.priority || null,
        priority: task.priority || null,
        subtasks: task.subtasks || [],
        scheduledTime: task.scheduledTime || null, // HH:mm format
        scheduledDate: task.scheduledDate || null, // YYYY-MM-DD
        autoStartTimer: task.autoStartTimer || false,
        notificationShown: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask); // Add to beginning
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return newTask;
}

/**
 * Update an existing task
 * @param {string} taskId 
 * @param {Object} updates 
 * @returns {Object} Updated task
 */
export function updateTask(taskId, updates) {
    const tasks = getAllTasks();
    const index = tasks.findIndex(t => t.id === taskId);

    if (index === -1) {
        throw new Error('Task not found');
    }

    tasks[index] = { ...tasks[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return tasks[index];
}

/**
 * Delete a task
 * @param {string} taskId 
 * @returns {boolean} Success
 */
export function deleteTask(taskId) {
    const tasks = getAllTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
}

/**
 * Get tasks for today (due today or pinned)
 * @returns {Array} Today's tasks
 */
export function getTodayTasks() {
    const tasks = getAllTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter(task => {
        // Show if pinned to today
        if (task.pinnedToday) return true;

        // Show if due today
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() === today.getTime();
        }

        return false;
    });
}

/**
 * Toggle task completion status
 * @param {string} taskId 
 * @returns {Object} Updated task
 */
export function toggleTaskComplete(taskId) {
    const tasks = getAllTasks();
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        throw new Error('Task not found');
    }

    return updateTask(taskId, { completed: !task.completed });
}

/**
 * Clear all tasks
 */
export function clearAllTasks() {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get tasks scheduled for a specific time
 * @param {string} time - HH:mm format
 * @returns {Array} Tasks scheduled for this time
 */
export function getScheduledTasks(time) {
    const tasks = getAllTasks();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    return tasks.filter(task => {
        // Must have scheduled time and auto-start enabled
        if (!task.scheduledTime || !task.autoStartTimer) return false;

        // Must not have shown notification yet
        if (task.notificationShown) return false;

        // Must be scheduled for today (either explicit date or recurring/implied)
        // For now, we only check if scheduledDate matches today if it exists
        if (task.scheduledDate && task.scheduledDate !== today) return false;

        return task.scheduledTime === time;
    });
}

/**
 * Mark task notification as shown
 * @param {string} taskId 
 */
export function markNotificationShown(taskId) {
    updateTask(taskId, { notificationShown: true });
}

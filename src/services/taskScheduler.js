// Task Scheduler Service
import { getScheduledTasks, markNotificationShown } from '../utils/taskStorage.js';
import { TaskPrompt } from '../components/taskPrompt.js';

class TaskSchedulerService {
    constructor() {
        this.interval = null;
        this.onTaskStart = null;
        this.prompt = null;
    }

    start(onTaskStart) {
        if (this.interval) return;

        this.onTaskStart = onTaskStart;
        this.prompt = new TaskPrompt(
            (task) => this.handleStart(task),
            (task) => this.handleDismiss(task)
        );

        // Check every minute
        this.checkTasks();
        this.interval = setInterval(() => this.checkTasks(), 60000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    checkTasks() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;

        const tasks = getScheduledTasks(currentTime);

        if (tasks.length > 0) {
            // Show prompt for the first task found
            // In a more complex version, we might handle multiple tasks
            this.prompt.show(tasks[0]);
        }
    }

    handleStart(task) {
        markNotificationShown(task.id);
        if (this.onTaskStart) {
            this.onTaskStart(task);
        }
    }

    handleDismiss(task) {
        markNotificationShown(task.id);
    }
}

export const taskScheduler = new TaskSchedulerService();

// YouTrack Service for timesheet integration
export class YouTrackService {
    constructor() {
        this.apiUrl = 'https://youtrack24.onedatasoftware.com';
        this.token = 'perm-R29rdWxoYXJp.NDYtMTM=.lYrz3UoU4JC6zRhAIyvEOEmvYWcZTS';
        this.isConfigured = true;

        // Save to localStorage
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('youtrack_api_url', this.apiUrl);
            localStorage.setItem('youtrack_token', this.token);
        }
    }

    /**
     * Check if YouTrack is configured
     */
    isAuthenticated() {
        return this.isConfigured && this.apiUrl && this.token;
    }

    /**
     * Get authentication headers
     */
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    /**
     * Test connection to YouTrack
     */
    async testConnection() {
        if (!this.isAuthenticated()) {
            throw new Error('YouTrack is not configured');
        }

        try {
            const response = await fetch(`${this.apiUrl}/api/users/me`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`Connection failed: ${response.status} ${response.statusText}`);
            }

            const user = await response.json();
            return { success: true, user };
        } catch (error) {
            console.error('YouTrack connection test failed:', error);
            throw error;
        }
    }

    /**
     * Get issue by ID
     * @param {string} issueId - YouTrack issue ID (e.g., "PROJ-123")
     */
    async getIssue(issueId) {
        if (!this.isAuthenticated()) {
            throw new Error('YouTrack is not configured');
        }

        try {
            const response = await fetch(`${this.apiUrl}/api/issues/${issueId}?fields=id,idReadable,summary,project(id,name),assignee(name),customFields(id,name,value)`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`Failed to get issue: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching issue:', error);
            throw error;
        }
    }

    /**
     * Get custom fields for an issue
     * @param {string} issueId 
     */
    async getIssueCustomFields(issueId) {
        const issue = await this.getIssue(issueId);
        return issue.customFields || [];
    }

    /**
     * Get work item attributes for a project
     * @param {string} projectId 
     */
    async getWorkItemAttributes(projectId) {
        if (!this.isAuthenticated()) {
            throw new Error('YouTrack is not configured');
        }

        try {
            // Try to fetch project-specific time tracking settings
            // Note: The endpoint might vary based on YouTrack version. 
            // We'll try the standard one for project time tracking settings.
            const response = await fetch(
                `${this.apiUrl}/api/admin/projects/${projectId}/timeTrackingSettings/workItemAttributes?fields=id,name,values(id,name)`,
                { headers: this.getAuthHeaders() }
            );

            if (!response.ok) {
                console.warn(`Failed to fetch work item attributes for project ${projectId}: ${response.status}`);
                return [];
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching work item attributes:', error);
            return [];
        }
    }

    /**
     * Search for issues by query
     * @param {string} query - YouTrack query (e.g., "project: PROJ" or search text)
     * @param {number} limit - Maximum number of results (default: 20)
     */
    async searchIssues(query, limit = 20) {
        if (!this.isAuthenticated()) {
            throw new Error('YouTrack is not configured');
        }

        try {
            const encodedQuery = encodeURIComponent(query);
            const response = await fetch(
                `${this.apiUrl}/api/issues?query=${encodedQuery}&fields=id,summary,project(id,name),numberInProject,idReadable,assignee(name)&$top=${limit}`,
                {
                    headers: this.getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(`Search failed: ${response.status} ${response.statusText}`);
            }

            const issues = await response.json();
            return issues.map(issue => ({
                id: issue.id,
                idReadable: issue.idReadable || issue.id,
                summary: issue.summary || '',
                project: issue.project || { name: '' },
                numberInProject: issue.numberInProject || '',
                assignee: issue.assignee?.name || null
            }));
        } catch (error) {
            console.error('Error searching issues:', error);
            throw error;
        }
    }

    /**
     * Add work item (timesheet entry) to an issue
     * @param {string} issueId - YouTrack issue ID
     * @param {number} durationMinutes - Duration in minutes
     * @param {string} description - Work description
     * @param {Date} date - Date of work (defaults to now)
     */
    async addWorkItem(issueId, durationMinutes, description = '', date = null) {
        if (!this.isAuthenticated()) {
            throw new Error('YouTrack is not configured');
        }

        if (!issueId) {
            throw new Error('Issue ID is required');
        }

        if (durationMinutes <= 0) {
            throw new Error('Duration must be greater than 0');
        }

        // Ensure date is a valid Date object and use the provided date (not current date)
        let workDate;
        if (date instanceof Date) {
            workDate = date;
        } else if (date) {
            workDate = new Date(date);
        } else {
            workDate = new Date();
        }

        // Validate date
        if (isNaN(workDate.getTime())) {
            throw new Error('Invalid date provided');
        }

        // YouTrack work item format - use timestamp in milliseconds
        const workItem = {
            duration: {
                presentation: `${durationMinutes}m`
            },
            date: workDate.getTime(),
            description: description || `Work tracked from focus timer`
        };

        console.log(`Logging work item for date: ${workDate.toISOString()} (${workDate.toLocaleDateString()})`);

        try {
            const response = await fetch(
                `${this.apiUrl}/api/issues/${issueId}/timeTracking/workItems`,
                {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(workItem)
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to add work item: ${response.status} ${response.statusText}. ${errorText}`);
            }

            const result = await response.json();
            console.log('Work item added successfully:', result);
            return result;
        } catch (error) {
            console.error('Error adding work item:', error);
            throw error;
        }
    }

    /**
     * Add work item from a timer session
     * Uses the session's actual start time to ensure timesheet is logged on the correct date
     * @param {Object} session - Session object from timer
     * @param {string} issueId - YouTrack issue ID
     */
    async addWorkItemFromSession(session, issueId) {
        if (!issueId) {
            throw new Error('Issue ID is required');
        }

        if (!session || !session.startTime) {
            throw new Error('Session must have a startTime');
        }

        // Convert workDuration from seconds to minutes
        const durationMinutes = Math.round(session.workDuration / 60);

        if (durationMinutes === 0) {
            throw new Error('Work duration is 0 minutes');
        }

        // Use the session's actual start time to ensure correct date in timesheet
        const workDate = new Date(session.startTime);

        // Validate the date from session
        if (isNaN(workDate.getTime())) {
            throw new Error(`Invalid session start time: ${session.startTime}`);
        }

        const description = session.description || session.taskName || `Work tracked from focus timer`;
        const workItemAttributes = session.workItemAttributes || []; // Array of { id, value: { id } } or similar

        // YouTrack work item format
        const workItem = {
            duration: {
                presentation: `${durationMinutes}m`
            },
            date: workDate.getTime(),
            description: description,
            attributes: workItemAttributes.map(attr => ({
                id: attr.id,
                value: attr.value
            }))
        };

        console.log(`Logging work item for date: ${workDate.toISOString()} (${workDate.toLocaleDateString()})`);
        console.log('Work Item Payload:', JSON.stringify(workItem, null, 2));

        try {
            const response = await fetch(
                `${this.apiUrl}/api/issues/${issueId}/timeTracking/workItems`,
                {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(workItem)
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to add work item: ${response.status} ${response.statusText}. ${errorText}`);
            }

            const result = await response.json();
            console.log('Work item added successfully:', result);
            return result;
        } catch (error) {
            console.error('Error adding work item:', error);
            throw error;
        }
    }
}

// Singleton instance
export const youtrackService = new YouTrackService();

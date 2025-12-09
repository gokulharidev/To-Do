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
     * Get work item types (Activity, Development, etc.) for time tracking
     * These are the types shown in the timesheet Type dropdown
     * @param {string} projectId 
     */
    async getWorkItemTypes(projectId) {
        if (!this.isAuthenticated()) {
            throw new Error('YouTrack is not configured');
        }

        try {
            console.log(`Fetching work item types for project: ${projectId}`);
            const response = await fetch(
                `${this.apiUrl}/api/admin/projects/${projectId}/timeTrackingSettings/workItemTypes?fields=id,name`,
                { headers: this.getAuthHeaders() }
            );

            if (!response.ok) {
                console.warn(`Failed to fetch work item types for project ${projectId}: ${response.status}`);
                const errorText = await response.text();
                console.warn('Error details:', errorText);
                return [];
            }

            const types = await response.json();
            console.log('Work item types response:', types);
            return types.map(t => ({
                id: t.id,
                name: t.name
            }));
        } catch (error) {
            console.error('Error fetching work item types:', error);
            return [];
        }
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
            console.log(`Fetching work item attributes for project: ${projectId}`);
            const response = await fetch(
                `${this.apiUrl}/api/admin/projects/${projectId}/timeTrackingSettings/workItemAttributes?fields=id,name,values(id,name)`,
                { headers: this.getAuthHeaders() }
            );

            if (!response.ok) {
                console.warn(`Failed to fetch attributes for project ${projectId}: ${response.status}`);
                return [];
            }

            const attributes = await response.json();
            console.log('Work item attributes response:', attributes);
            return attributes;
        } catch (error) {
            console.error('Error fetching work item attributes:', error);
            return [];
        }
    }

    /**
     * Get work item attributes for an issue
     * @param {string} issueId - Issue ID (e.g., "PROJ-123")
     */
    async getWorkItemAttributesForIssue(issueId) {
        // First try to get project ID from issue
        try {
            const issue = await this.getIssue(issueId);
            if (issue && issue.project && issue.project.id) {
                return await this.getWorkItemAttributes(issue.project.id);
            }
        } catch (e) {
            console.warn('Could not fetch issue details to get project ID', e);
        }

        // Fallback to existing logic if project ID not found (though unlikely if issue exists)
        return [];
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
            text: description || `Work tracked from focus timer`  // YouTrack uses 'text' field
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
        const workItemType = session.workItemType || null; // Work item type (Activity, Development, etc.)
        const billabilityValue = session.billabilityValue || null; // Billability attribute value { id, name }

        // YouTrack work item format
        const workItem = {
            duration: {
                presentation: `${durationMinutes}m`
            },
            date: workDate.getTime(),
            text: description,  // YouTrack uses 'text' field for description
            ...(workItemType && { type: { id: workItemType.id } }), // Add type if selected
        };

        // Add attributes if present and we have an ID
        if (billabilityValue) {
            // We need the attribute ID. If it's not in the session, we cannot send it reliably.
            // Sending a hardcoded ID for a project that doesn't have it causes 500 errors.
            const attributeId = session.billabilityAttributeId;

            if (attributeId) {
                // Check if ID is a placeholder (new value created in UI but not real ID)
                const valuePayload = billabilityValue.id && billabilityValue.id.startsWith('placeholder-')
                    ? { name: billabilityValue.name }
                    : { id: billabilityValue.id };

                workItem.attributes = [
                    {
                        id: attributeId,
                        value: valuePayload
                    }
                ];
            } else {
                console.warn('Skipping Billability: No attribute ID provided in session. Project might not support it.');
            }
        }

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


    /**
     * Update an existing work item
     * @param {string} issueId 
     * @param {string} workItemId 
     * @param {Object} data - { duration, date, description, workItemType, billabilityValue, billabilityAttributeId }
     */
    async updateWorkItem(issueId, workItemId, data) {
        if (!this.isAuthenticated()) {
            throw new Error('YouTrack is not configured');
        }

        const payload = {};

        if (data.duration) {
            payload.duration = { presentation: `${data.duration}m` };
        }
        if (data.date) {
            payload.date = new Date(data.date).getTime();
        }
        if (data.description !== undefined) {
            payload.text = data.description;
        }
        if (data.workItemType) {
            payload.type = { id: data.workItemType.id };
        }

        if (data.billabilityValue) {
            // Only send attribute if we have a valid ID
            const attributeId = data.billabilityAttributeId;

            if (attributeId) {
                const valuePayload = data.billabilityValue.id && data.billabilityValue.id.startsWith('placeholder-')
                    ? { name: data.billabilityValue.name }
                    : { id: data.billabilityValue.id };

                payload.attributes = [
                    {
                        id: attributeId,
                        value: valuePayload
                    }
                ];
            } else {
                console.warn('Skipping Billability in update: No attribute ID provided. Project might not support it.');
            }
        }

        try {
            const response = await fetch(
                `${this.apiUrl}/api/issues/${issueId}/timeTracking/workItems/${workItemId}`,
                {
                    method: 'POST', // YouTrack uses POST for updates too (or PUT)
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to update work item: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating work item:', error);
            throw error;
        }
    }
}

// Singleton instance
export const youtrackService = new YouTrackService();

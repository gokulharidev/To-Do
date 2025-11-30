
import { youtrackService } from './src/services/youtrack.js';

// Polyfill fetch for Node.js if needed (Node 18+ has native fetch)
// If running in older node, might need node-fetch, but user seems to have modern environment.

async function verifyRealAttributes() {
    console.log('--- Verifying Real YouTrack API Attributes ---');

    // 1. Test Connection
    try {
        const user = await youtrackService.testConnection();
        console.log('Connection successful:', user.user.name);
    } catch (error) {
        console.error('Connection failed:', error.message);
        return;
    }

    // 2. Search for an issue to get a valid Project ID
    let projectId = null;
    try {
        console.log('Searching for an issue to get Project ID...');
        const issues = await youtrackService.searchIssues('State: Open', 1);
        if (issues.length > 0) {
            const issue = issues[0];
            console.log(`Found issue: ${issue.idReadable}`);
            if (issue.project && issue.project.id) {
                projectId = issue.project.id;
                console.log(`Project ID: ${projectId} (${issue.project.name})`);
            } else {
                console.error('Issue found but no project ID available.');
            }
        } else {
            console.warn('No issues found. Cannot infer project ID.');
        }
    } catch (error) {
        console.error('Search failed:', error.message);
    }

    if (!projectId) {
        console.log('Skipping attributes fetch due to missing Project ID.');
        return;
    }

    // 3. Fetch Work Item Attributes for that Project
    try {
        console.log(`Fetching attributes for project ${projectId}...`);
        const attributes = await youtrackService.getWorkItemAttributes(projectId);
        console.log('Attributes Response:', JSON.stringify(attributes, null, 2));

        if (attributes.length === 0) {
            console.warn('No attributes returned. Check permissions or if Time Tracking is enabled for this project.');
        }
    } catch (error) {
        console.error('Fetch attributes failed:', error.message);
    }
}

verifyRealAttributes();

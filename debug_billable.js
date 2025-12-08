
import { youtrackService } from './src/services/youtrack.js';

async function debugBillability() {
    console.log('--- Debugging Billability ---');

    try {
        // 1. Search for an issue to get Project ID
        const issues = await youtrackService.searchIssues('', 1);
        if (issues.length === 0) {
            console.log('No issues found.');
            return;
        }
        const issue = issues[0];
        const projectId = issue.project.id;
        console.log(`Project: ${issue.project.name} (${projectId})`);

        // 2. Fetch Project Time Tracking Settings
        console.log('\nFetching Project Time Tracking Settings...');
        const settingsUrl = `${youtrackService.apiUrl}/api/admin/projects/${projectId}/timeTrackingSettings?fields=enabled,workItemTypes(id,name),workItemAttributes(id,name,values(id,name))`;
        const settingsResponse = await fetch(settingsUrl, { headers: youtrackService.getAuthHeaders() });

        if (settingsResponse.ok) {
            const settings = await settingsResponse.json();
            console.log('Settings:', JSON.stringify(settings, null, 2));

            if (settings.workItemAttributes && settings.workItemAttributes.length > 0) {
                console.log('Found Work Item Attributes:', settings.workItemAttributes.map(a => a.name));
            } else {
                console.log('No Work Item Attributes found in settings.');
            }
        } else {
            console.log('Failed to fetch settings:', settingsResponse.status);
        }

        // 3. Fetch Global Time Tracking Settings (just in case)
        console.log('\nFetching Global Time Tracking Settings...');
        const globalUrl = `${youtrackService.apiUrl}/api/admin/timeTrackingSettings?fields=workItemAttributes(id,name,values(id,name))`;
        const globalResponse = await fetch(globalUrl, { headers: youtrackService.getAuthHeaders() });

        if (globalResponse.ok) {
            const globalSettings = await globalResponse.json();
            console.log('Global Settings:', JSON.stringify(globalSettings, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

debugBillability();

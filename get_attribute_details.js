
import { youtrackService } from './src/services/youtrack.js';

async function getAttributeDetails() {
    console.log('--- Fetching Attribute Details ---');
    const attributeId = '284-63'; // Found from inspection

    try {
        // Try Global
        console.log(`Fetching global attribute ${attributeId}...`);
        const globalUrl = `${youtrackService.apiUrl}/api/admin/timeTrackingSettings/workItemAttributes/${attributeId}?fields=id,name,values(id,name)`;
        const globalResponse = await fetch(globalUrl, { headers: youtrackService.getAuthHeaders() });

        if (globalResponse.ok) {
            const data = await globalResponse.json();
            console.log('Global Attribute Details:', JSON.stringify(data, null, 2));
            return;
        } else {
            console.log('Not found globally:', globalResponse.status);
        }

        // Try Project specific (need a project ID)
        // We saw GI-31 has it. Project GI.
        const issues = await youtrackService.searchIssues('id: GI-31', 1);
        if (issues.length > 0) {
            const projectId = issues[0].project.id;
            console.log(`Fetching for project ${projectId}...`);
            const projUrl = `${youtrackService.apiUrl}/api/admin/projects/${projectId}/timeTrackingSettings/workItemAttributes/${attributeId}?fields=id,name,values(id,name)`;
            const projResponse = await fetch(projUrl, { headers: youtrackService.getAuthHeaders() });

            if (projResponse.ok) {
                const data = await projResponse.json();
                console.log('Project Attribute Details:', JSON.stringify(data, null, 2));
            } else {
                console.log('Not found in project:', projResponse.status);
                console.log(await projResponse.text());
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

getAttributeDetails();

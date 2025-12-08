
import { youtrackService } from './src/services/youtrack.js';

async function getGlobalAttributes() {
    console.log('--- Fetching Global Attributes ---');
    try {
        const url = `${youtrackService.apiUrl}/api/admin/timeTrackingSettings?fields=workItemAttributes(id,name,values(id,name))`;
        const response = await fetch(url, { headers: youtrackService.getAuthHeaders() });

        if (response.ok) {
            const data = await response.json();
            console.log('Global Settings:', JSON.stringify(data, null, 2));
        } else {
            console.log('Failed:', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

getGlobalAttributes();

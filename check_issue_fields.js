
import { youtrackService } from './src/services/youtrack.js';

async function checkIssueCustomFields() {
    console.log('--- Checking Issue Custom Fields ---');
    try {
        // Search for the issue GI-31 or any recent one
        const issues = await youtrackService.searchIssues('id: GI-31', 1);
        if (issues.length === 0) {
            console.log('Issue GI-31 not found, searching others...');
        }

        const targetIssue = issues.length > 0 ? issues[0] : (await youtrackService.searchIssues('', 1))[0];

        if (!targetIssue) {
            console.log('No issues found.');
            return;
        }

        console.log(`Inspecting Issue: ${targetIssue.idReadable}`);

        // Fetch full issue details including custom fields
        const response = await fetch(
            `${youtrackService.apiUrl}/api/issues/${targetIssue.id}?fields=id,summary,customFields(id,name,value(id,name,login),projectCustomField(field(name)))`,
            { headers: youtrackService.getAuthHeaders() }
        );

        if (response.ok) {
            const issueData = await response.json();
            console.log('Custom Fields:');
            issueData.customFields.forEach(cf => {
                const fieldName = cf.projectCustomField?.field?.name || cf.name;
                let value = cf.value;
                if (value && typeof value === 'object') {
                    value = value.name || value.login || JSON.stringify(value);
                }
                console.log(`- ${fieldName}: ${value} (ID: ${cf.id})`);
                if (fieldName.toLowerCase().includes('bill')) {
                    console.log('  FULL OBJECT:', JSON.stringify(cf, null, 2));
                }
            });
        } else {
            console.log('Failed to fetch issue details:', response.status);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkIssueCustomFields();

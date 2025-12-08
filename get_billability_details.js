
import { youtrackService } from './src/services/youtrack.js';

async function getBillabilityDetails() {
    console.log('--- Inspecting Work Items for Billability ---');

    try {
        // 1. Search for issues that might have work items
        // We'll search for issues updated recently
        const issues = await youtrackService.searchIssues('updated: today .. Now', 10);

        if (issues.length === 0) {
            console.log('No recent issues found. Searching all open issues...');
            const allIssues = await youtrackService.searchIssues('State: Open', 10);
            if (allIssues.length === 0) {
                console.log('No open issues found.');
                return;
            }
            await inspectIssues(allIssues);
        } else {
            await inspectIssues(issues);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

async function inspectIssues(issues) {
    for (const issue of issues) {
        console.log(`\nChecking Issue: ${issue.idReadable} (${issue.id})`);

        try {
            const response = await fetch(
                `${youtrackService.apiUrl}/api/issues/${issue.id}/timeTracking/workItems?fields=id,date,duration(presentation),type(name),attributes(id,name,value(id,name))`,
                { headers: youtrackService.getAuthHeaders() }
            );

            if (response.ok) {
                const workItems = await response.json();
                console.log(`Found ${workItems.length} work items.`);

                workItems.forEach((item, index) => {
                    console.log(`  Work Item ${index + 1}: Type=${item.type?.name}, Duration=${item.duration?.presentation}`);
                    if (item.attributes && item.attributes.length > 0) {
                        console.log('    Attributes:', JSON.stringify(item.attributes, null, 2));
                    } else {
                        console.log('    No attributes.');
                    }
                });
            } else {
                console.log('Failed to fetch work items:', response.status);
            }
        } catch (e) {
            console.error('Error fetching work items for issue:', e);
        }
    }
}

getBillabilityDetails();

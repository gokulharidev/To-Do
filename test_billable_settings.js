// Check time tracking settings for billable configuration
const API_TOKEN = 'perm-R29rdWxoYXJp.NDYtMTM=.lYrz3UoU4JC6zRhAIyvEOEmvYWcZTS';
const API_URL = 'https://youtrack24.onedatasoftware.com';
const PROJECT_ID = 'ONEDATA';

async function checkBillableSettings() {
    try {
        console.log('=== Checking Time Tracking Settings ===\n');
        
        // Get detailed time tracking settings
        const url = `${API_URL}/api/admin/projects/${PROJECT_ID}/timeTrackingSettings?fields=$type,enabled,workItemTypes(id,name,autoAttached),estimate(field(name)),timeSpent(field(name))`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const settings = await response.json();
            console.log('Time Tracking Settings:');
            console.log(JSON.stringify(settings, null, 2));
        } else {
            console.log(`Error: ${response.status}`);
            console.log(await response.text());
        }

        // Check global time tracking settings
        console.log('\n\n=== Checking Global Time Tracking Settings ===\n');
        const globalUrl = `${API_URL}/api/admin/timeTrackingSettings?fields=$type,enabled`;
        
        const globalResponse = await fetch(globalUrl, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Accept': 'application/json'
            }
        });

        if (globalResponse.ok) {
            const globalSettings = await globalResponse.json();
            console.log('Global Settings:');
            console.log(JSON.stringify(globalSettings, null, 2));
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkBillableSettings();

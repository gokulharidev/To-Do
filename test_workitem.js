// Test work item creation to see what fields are accepted
const API_TOKEN = 'perm-R29rdWxoYXJp.NDYtMTM=.lYrz3UoU4JC6zRhAIyvEOEmvYWcZTS';
const API_URL = 'https://youtrack24.onedatasoftware.com';
const ISSUE_ID = 'ONEDATA-1056';

async function testWorkItemCreation() {
    try {
        console.log('\n=== Testing Work Item Creation ===');
        
        // First, let's see what a work item looks like
        const getUrl = `${API_URL}/api/issues/${ISSUE_ID}/timeTracking/workItems?fields=id,text,date,duration,type(id,name),author(id,name)`;
        console.log(`\nGetting existing work items:`);
        console.log(`URL: ${getUrl}`);
        
        const getResponse = await fetch(getUrl, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Accept': 'application/json'
            }
        });

        console.log(`Status: ${getResponse.status}`);
        
        if (getResponse.ok) {
            const workItems = await getResponse.json();
            console.log('\n✓ Existing work items:');
            console.log(JSON.stringify(workItems, null, 2));
        }

        // Now let's check what fields are available when we GET the work item details endpoint
        console.log('\n\n=== Checking available fields ===');
        const fieldsUrl = `${API_URL}/api/admin/projects/ONEDATA/timeTrackingSettings?fields=$type,enabled,workItemTypes(id,name,autoAttached)`;
        console.log(`URL: ${fieldsUrl}`);
        
        const fieldsResponse = await fetch(fieldsUrl, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Accept': 'application/json'
            }
        });

        if (fieldsResponse.ok) {
            const settings = await fieldsResponse.json();
            console.log('\nTime Tracking Settings:');
            console.log(JSON.stringify(settings, null, 2));
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testWorkItemCreation();

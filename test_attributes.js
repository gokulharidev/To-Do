// Test script to check work item attributes API response
const API_TOKEN = 'perm-R29rdWxoYXJp.NDYtMTM=.lYrz3UoU4JC6zRhAIyvEOEmvYWcZTS';
const API_URL = 'https://youtrack24.onedatasoftware.com';
const PROJECT_ID = 'ONEDATA';

async function testWorkItemAttributes() {
    try {
        console.log(`\n=== Testing Work Item Attributes API ===`);
        console.log(`Project: ${PROJECT_ID}`);
        
        const url = `${API_URL}/api/admin/projects/${PROJECT_ID}/timeTrackingSettings/workItemAttributes?fields=id,name,values(id,name)`;
        console.log(`URL: ${url}\n`);
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            return;
        }

        const data = await response.json();
        console.log('\n=== Response Data ===');
        console.log(JSON.stringify(data, null, 2));
        
        // Check if it's an array
        if (Array.isArray(data)) {
            console.log(`\n✓ Received array with ${data.length} attributes`);
            data.forEach((attr, index) => {
                console.log(`\nAttribute ${index + 1}:`);
                console.log(`  ID: ${attr.id}`);
                console.log(`  Name: ${attr.name}`);
                if (attr.values && attr.values.length > 0) {
                    console.log(`  Values: ${attr.values.length} options`);
                    attr.values.forEach(val => {
                        console.log(`    - ${val.name} (${val.id})`);
                    });
                } else {
                    console.log(`  Values: None (text input field)`);
                }
            });
        } else {
            console.log('\n✗ Response is not an array');
            console.log('Type:', typeof data);
        }

    } catch (error) {
        console.error('\n=== Error ===');
        console.error(error.message);
        console.error(error.stack);
    }
}

testWorkItemAttributes();

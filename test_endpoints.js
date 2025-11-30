// Test different API endpoints for work item attributes
const API_TOKEN = 'perm-R29rdWxoYXJp.NDYtMTM=.lYrz3UoU4JC6zRhAIyvEOEmvYWcZTS';
const API_URL = 'https://youtrack24.onedatasoftware.com';
const PROJECT_ID = 'ONEDATA';

async function testEndpoint(endpoint, description) {
    try {
        console.log(`\n=== Testing: ${description} ===`);
        const url = `${API_URL}${endpoint}`;
        console.log(`URL: ${url}`);
        
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
            console.error('Error:', errorText.substring(0, 200));
            return null;
        }

        const data = await response.json();
        console.log('✓ Success!');
        console.log('Response:', JSON.stringify(data, null, 2).substring(0, 500));
        return data;

    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

async function runTests() {
    // Try different endpoints
    await testEndpoint(
        `/api/admin/projects/${PROJECT_ID}/timeTrackingSettings?fields=enabled,workItemTypes(id,name)`,
        'Time Tracking Settings'
    );
    
    await testEndpoint(
        `/api/admin/projects/${PROJECT_ID}/timeTrackingSettings/workItemTypes?fields=id,name`,
        'Work Item Types'
    );

    await testEndpoint(
        `/api/admin/projects/${PROJECT_ID}/customFields?fields=id,name,field(id,name,fieldType(id))`,
        'Project Custom Fields'
    );

    await testEndpoint(
        `/api/admin/customFieldSettings/bundles?fields=id,name,values(id,name)`,
        'Custom Field Bundles'
    );

    await testEndpoint(
        `/api/admin/projects/${PROJECT_ID}?fields=id,name,customFields(id,field(id,name,fieldType(id)),bundle(id,values(id,name)))`,
        'Project with Custom Fields'
    );
}

runTests();

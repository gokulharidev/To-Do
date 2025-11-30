// Get all billability values
const API_TOKEN = 'perm-R29rdWxoYXJp.NDYtMTM=.lYrz3UoU4JC6zRhAIyvEOEmvYWcZTS';
const API_URL = 'https://youtrack24.onedatasoftware.com';
const PROJECT_ID = 'ONEDATA';

async function getAllBillabilityValues() {
    console.log('=== Getting All Billability Values ===\n');
    
    // Try different endpoints to get the values
    const endpoints = [
        {
            name: 'Project attribute with values',
            url: `${API_URL}/api/admin/projects/${PROJECT_ID}/customFields/284-26?fields=id,field(name),bundle(values(id,name))`
        },
        {
            name: 'Work item attributes',
            url: `${API_URL}/api/admin/projects/${PROJECT_ID}/workItemAttributes?fields=id,name,values(id,name)`
        },
        {
            name: 'Project time tracking with attributes',
            url: `${API_URL}/api/admin/projects/${PROJECT_ID}/timeTrackingSettings?fields=workItemAttributes(id,name,values(id,name))`
        }
    ];
    
    for (const endpoint of endpoints) {
        console.log(`\nTrying: ${endpoint.name}`);
        console.log(`URL: ${endpoint.url}`);
        
        try {
            const response = await fetch(endpoint.url, {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Accept': 'application/json'
                }
            });
            
            console.log(`Status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Response:');
                console.log(JSON.stringify(data, null, 2));
            } else {
                const error = await response.text();
                console.log('Error:', error);
            }
        } catch (error) {
            console.log('Exception:', error.message);
        }
    }
    
    // Also check all work item attributes for the project
    console.log('\n\n=== Checking All Project Work Item Attributes ===');
    const attrUrl = `${API_URL}/api/admin/projects/${PROJECT_ID}?fields=workItemAttributes(id,name,values(id,name))`;
    
    const attrResponse = await fetch(attrUrl, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Accept': 'application/json'
        }
    });
    
    if (attrResponse.ok) {
        const data = await attrResponse.json();
        console.log(JSON.stringify(data, null, 2));
    }
}

getAllBillabilityValues();

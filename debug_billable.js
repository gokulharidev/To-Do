// Debug: Check how billable is configured in YouTrack
const API_TOKEN = 'perm-R29rdWxoYXJp.NDYtMTM=.lYrz3UoU4JC6zRhAIyvEOEmvYWcZTS';
const API_URL = 'https://youtrack24.onedatasoftware.com';
const PROJECT_ID = 'ONEDATA';
const ISSUE_ID = 'ONEDATA-1056';

async function debugBillable() {
    console.log('=== DEBUG: Billable Configuration ===\n');
    
    // 1. Check time tracking settings with all fields
    console.log('1. Checking time tracking settings...');
    const settingsUrl = `${API_URL}/api/admin/projects/${PROJECT_ID}/timeTrackingSettings?fields=$type,enabled,workItemTypes(id,name),workItemAttributes(id,name,values(id,name))`;
    
    const settingsResponse = await fetch(settingsUrl, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Accept': 'application/json'
        }
    });
    
    if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        console.log('\nTime Tracking Settings:');
        console.log(JSON.stringify(settings, null, 2));
        
        if (settings.workItemAttributes && settings.workItemAttributes.length > 0) {
            console.log('\n✓ Work Item Attributes found:');
            settings.workItemAttributes.forEach(attr => {
                console.log(`  - ${attr.name} (ID: ${attr.id})`);
                if (attr.values && attr.values.length > 0) {
                    console.log(`    Values: ${attr.values.map(v => v.name).join(', ')}`);
                }
            });
        } else {
            console.log('\n✗ No work item attributes configured');
        }
    } else {
        console.log('Failed:', await settingsResponse.text());
    }
    
    // 2. Get existing work items to see their structure
    console.log('\n\n2. Checking existing work item structure...');
    const workItemsUrl = `${API_URL}/api/issues/${ISSUE_ID}/timeTracking/workItems?fields=id,text,date,duration(minutes),type(id,name),author(name),attributes(id,name,value)&$top=3`;
    
    const workItemsResponse = await fetch(workItemsUrl, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Accept': 'application/json'
        }
    });
    
    if (workItemsResponse.ok) {
        const workItems = await workItemsResponse.json();
        console.log('\nRecent work items with attributes:');
        console.log(JSON.stringify(workItems, null, 2));
    }
    
    // 3. Try to create a work item with attributes
    console.log('\n\n3. Testing work item creation with attributes...');
    
    // First, get the billable attribute ID if it exists
    if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        const billableAttr = settings.workItemAttributes?.find(attr => 
            attr.name.toLowerCase().includes('bill')
        );
        
        if (billableAttr) {
            console.log(`\nFound billable attribute: ${billableAttr.name} (${billableAttr.id})`);
            
            // Create test work item with attribute
            const testPayload = {
                date: Date.now(),
                duration: { minutes: 1 },
                text: 'TEST: Work item with billable attribute',
                type: { id: '160-0' },
                attributes: [
                    {
                        id: billableAttr.id,
                        value: billableAttr.values && billableAttr.values.length > 0 
                            ? { id: billableAttr.values[0].id }
                            : null
                    }
                ]
            };
            
            console.log('\nPayload:', JSON.stringify(testPayload, null, 2));
            
            const createResponse = await fetch(
                `${API_URL}/api/issues/${ISSUE_ID}/timeTracking/workItems`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${API_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(testPayload)
                }
            );
            
            if (createResponse.ok) {
                const result = await createResponse.json();
                console.log('\n✓ Created:', result.id);
                
                // Fetch it back to verify
                const verifyUrl = `${API_URL}/api/issues/${ISSUE_ID}/timeTracking/workItems/${result.id}?fields=id,text,attributes(id,name,value)`;
                const verifyResponse = await fetch(verifyUrl, {
                    headers: {
                        'Authorization': `Bearer ${API_TOKEN}`,
                        'Accept': 'application/json'
                    }
                });
                
                if (verifyResponse.ok) {
                    const verified = await verifyResponse.json();
                    console.log('\nVerified work item:');
                    console.log(JSON.stringify(verified, null, 2));
                }
            } else {
                console.log('\n✗ Failed:', await createResponse.text());
            }
        } else {
            console.log('\n✗ No billable attribute found in time tracking settings');
        }
    }
}

debugBillable();

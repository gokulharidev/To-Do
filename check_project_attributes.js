// Check project-specific work item attributes with proper permissions
const API_TOKEN = 'perm-R29rdWxoYXJp.NDYtMTM=.lYrz3UoU4JC6zRhAIyvEOEmvYWcZTS';
const API_URL = 'https://youtrack24.onedatasoftware.com';
const PROJECT_ID = 'ONEDATA';
const ISSUE_ID = 'ONEDATA-1056';

async function checkProjectWorkItemAttributes() {
    console.log('=== Checking Project-Specific Work Item Attributes ===\n');
    
    // 1. Get project details with all time tracking info
    console.log('1. Getting project time tracking configuration...');
    const projectUrl = `${API_URL}/api/admin/projects/${PROJECT_ID}?fields=id,name,timeTrackingSettings(enabled,workItemTypes(id,name))`;
    
    const projectResponse = await fetch(projectUrl, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Accept': 'application/json'
        }
    });
    
    console.log(`Status: ${projectResponse.status}`);
    if (projectResponse.ok) {
        const project = await projectResponse.json();
        console.log('Project config:');
        console.log(JSON.stringify(project, null, 2));
    } else {
        console.log('Error:', await projectResponse.text());
    }
    
    // 2. Check existing work item to understand attribute structure
    console.log('\n\n2. Analyzing existing work item with attributes...');
    const workItemUrl = `${API_URL}/api/issues/${ISSUE_ID}/timeTracking/workItems/181-152089?fields=id,text,attributes(id,name,value(id,name))`;
    
    const workItemResponse = await fetch(workItemUrl, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Accept': 'application/json'
        }
    });
    
    if (workItemResponse.ok) {
        const workItem = await workItemResponse.json();
        console.log('Work item with attributes:');
        console.log(JSON.stringify(workItem, null, 2));
        
        // Extract billability attribute details
        const billabilityAttr = workItem.attributes?.find(a => a.name === 'Billability');
        if (billabilityAttr) {
            console.log('\n✓ Billability Attribute Found:');
            console.log(`   ID: ${billabilityAttr.id}`);
            console.log(`   Name: ${billabilityAttr.name}`);
            console.log(`   Current Value: ${billabilityAttr.value?.name || 'null'} (${billabilityAttr.value?.id || 'null'})`);
        }
    }
    
    // 3. Try to get work item attribute definitions (might need different permission)
    console.log('\n\n3. Attempting to get work item attribute definitions...');
    
    const attemptUrls = [
        `${API_URL}/api/admin/projects/${PROJECT_ID}/timeTracking/workItemAttributes`,
        `${API_URL}/api/workItemAttributes?project=${PROJECT_ID}`,
        `${API_URL}/api/admin/timeTracking/workItemAttributes?project=${PROJECT_ID}`,
        `${API_URL}/api/admin/customFieldSettings/workItemAttributes`
    ];
    
    for (const url of attemptUrls) {
        console.log(`\nTrying: ${url}`);
        try {
            const resp = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Accept': 'application/json'
                }
            });
            console.log(`  Status: ${resp.status}`);
            if (resp.ok) {
                const data = await resp.json();
                console.log('  ✓ Success:', JSON.stringify(data, null, 2).substring(0, 500));
            } else {
                const error = await resp.text();
                console.log(`  Error: ${error.substring(0, 200)}`);
            }
        } catch (e) {
            console.log(`  Exception: ${e.message}`);
        }
    }
    
    // 4. Check if we can get all possible values for billability
    console.log('\n\n4. Looking for billability values by analyzing multiple work items...');
    const allWorkItemsUrl = `${API_URL}/api/issues/${ISSUE_ID}/timeTracking/workItems?fields=attributes(id,name,value(id,name))&$top=50`;
    
    const allWorkItemsResponse = await fetch(allWorkItemsUrl, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Accept': 'application/json'
        }
    });
    
    if (allWorkItemsResponse.ok) {
        const allWorkItems = await allWorkItemsResponse.json();
        const billabilityValues = new Set();
        
        allWorkItems.forEach(item => {
            const billAttr = item.attributes?.find(a => a.name === 'Billability');
            if (billAttr && billAttr.value) {
                billabilityValues.add(JSON.stringify({
                    id: billAttr.value.id,
                    name: billAttr.value.name
                }));
            }
        });
        
        console.log(`\nFound ${billabilityValues.size} unique billability values from ${allWorkItems.length} work items:`);
        Array.from(billabilityValues).forEach(val => {
            const parsed = JSON.parse(val);
            console.log(`  - ${parsed.name} (ID: ${parsed.id})`);
        });
    }
    
    // 5. Try creating a work item with billability attribute
    console.log('\n\n5. Testing work item creation with Billability attribute...');
    
    // Assume "Billable" and "Non Billable" are the values, need to find Billable ID
    const testPayload = {
        date: Date.now(),
        duration: { minutes: 1 },
        text: 'TEST: Work item with Billability=Billable',
        type: { id: '160-0' },
        attributes: [
            {
                id: '284-26', // Billability attribute ID
                value: {
                    id: '477-8' // Guessing Billable might be 477-8 (Non Billable is 477-9)
                }
            }
        ]
    };
    
    console.log('Test payload:', JSON.stringify(testPayload, null, 2));
    
    const createResponse = await fetch(
        `${API_URL}/api/issues/${ISSUE_ID}/timeTracking/workItems?fields=id,text,attributes(id,name,value(id,name))`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(testPayload)
        }
    );
    
    console.log(`\nCreate status: ${createResponse.status}`);
    
    if (createResponse.ok) {
        const created = await createResponse.json();
        console.log('✓ Created successfully:');
        console.log(JSON.stringify(created, null, 2));
    } else {
        const error = await createResponse.text();
        console.log('✗ Failed:', error);
        
        // Try with different value ID
        console.log('\n\nRetrying with empty value to see error message...');
        testPayload.attributes[0].value = { id: '477-10' }; // Try another ID
        
        const retryResponse = await fetch(
            `${API_URL}/api/issues/${ISSUE_ID}/timeTracking/workItems?fields=id,text,attributes(id,name,value(id,name))`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(testPayload)
            }
        );
        
        console.log(`Retry status: ${retryResponse.status}`);
        if (retryResponse.ok) {
            const result = await retryResponse.json();
            console.log('Result:', JSON.stringify(result, null, 2));
        } else {
            console.log('Error:', await retryResponse.text());
        }
    }
}

checkProjectWorkItemAttributes();

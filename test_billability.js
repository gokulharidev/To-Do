// Test billability options in YouTrack API
const API_TOKEN = 'perm-R29rdWxoYXJp.NDYtMTM=.lYrz3UoU4JC6zRhAIyvEOEmvYWcZTS';
const API_URL = 'https://youtrack24.onedatasoftware.com';
const ISSUE_ID = 'ONEDATA-1056';

async function testBillability() {
    try {
        console.log('\n=== Checking Work Item Structure with Billability ===\n');
        
        // Get existing work items with all fields
        const url = `${API_URL}/api/issues/${ISSUE_ID}/timeTracking/workItems?fields=id,text,date,duration(minutes),type(id,name),author(id,name),billable`;
        console.log(`URL: ${url}\n`);
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const workItems = await response.json();
            console.log('Sample work items with billable field:');
            console.log(JSON.stringify(workItems.slice(0, 3), null, 2));
            
            // Check if any have billable field
            const hasBillable = workItems.some(item => 'billable' in item);
            console.log(`\n✓ Billable field exists: ${hasBillable}`);
            
            if (hasBillable) {
                const billableItems = workItems.filter(item => item.billable === true);
                const nonBillableItems = workItems.filter(item => item.billable === false);
                console.log(`  - Billable items: ${billableItems.length}`);
                console.log(`  - Non-billable items: ${nonBillableItems.length}`);
            }
        }

        // Test creating a work item with billable field
        console.log('\n\n=== Testing Work Item Creation with Billable ===\n');
        const testPayload = {
            date: Date.now(),
            duration: {
                minutes: 30
            },
            text: 'Test billability feature',
            type: {
                id: '160-0' // Development
            },
            billable: true
        };

        console.log('Test payload:');
        console.log(JSON.stringify(testPayload, null, 2));
        console.log('\nNote: Not actually creating to avoid duplicate entries');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testBillability();

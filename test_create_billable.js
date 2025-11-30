// Actually test creating a work item with billable field
const API_TOKEN = 'perm-R29rdWxoYXJp.NDYtMTM=.lYrz3UoU4JC6zRhAIyvEOEmvYWcZTS';
const API_URL = 'https://youtrack24.onedatasoftware.com';
const ISSUE_ID = 'ONEDATA-1056';

async function createWithBillable() {
    try {
        console.log('=== Creating work item WITH billable field ===\n');
        
        const payload = {
            date: Date.now(),
            duration: {
                minutes: 1
            },
            text: 'TEST: Billable test entry',
            type: {
                id: '160-0' // Development
            },
            billable: true
        };

        const url = `${API_URL}/api/issues/${ISSUE_ID}/timeTracking/workItems?fields=id,text,billable,date,duration(minutes)`;
        
        console.log('Payload:', JSON.stringify(payload, null, 2));
        console.log('\nCreating...\n');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const result = await response.json();
            console.log('\n✓ Created successfully!');
            console.log('Response:', JSON.stringify(result, null, 2));
            
            if ('billable' in result) {
                console.log(`\n✓ Billable field is supported: ${result.billable}`);
            } else {
                console.log('\n✗ Billable field not in response');
            }
            
            return result.id;
        } else {
            const error = await response.text();
            console.error('Error:', error);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

createWithBillable();

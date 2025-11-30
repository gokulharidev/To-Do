// Get billability attribute details
const API_TOKEN = 'perm-R29rdWxoYXJp.NDYtMTM=.lYrz3UoU4JC6zRhAIyvEOEmvYWcZTS';
const API_URL = 'https://youtrack24.onedatasoftware.com';
const ISSUE_ID = 'ONEDATA-1056';

async function getBillabilityDetails() {
    console.log('=== Getting Billability Attribute Details ===\n');
    
    // Get work items with full attribute details
    const url = `${API_URL}/api/issues/${ISSUE_ID}/timeTracking/workItems?fields=id,text,attributes(id,name,value(id,name))&$top=5`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Accept': 'application/json'
        }
    });
    
    if (response.ok) {
        const workItems = await response.json();
        
        console.log('Work items with attributes:');
        workItems.forEach((item, i) => {
            console.log(`\n${i + 1}. ${item.text?.substring(0, 50)}...`);
            console.log(`   ID: ${item.id}`);
            
            if (item.attributes && item.attributes.length > 0) {
                console.log('   Attributes:');
                item.attributes.forEach(attr => {
                    console.log(`     - ${attr.name} (${attr.id})`);
                    if (attr.value) {
                        console.log(`       Value: ${JSON.stringify(attr.value)}`);
                    } else {
                        console.log(`       Value: null`);
                    }
                });
            }
        });
        
        // Find billability attribute
        const billabilityAttr = workItems[0]?.attributes?.find(a => a.name === 'Billability');
        if (billabilityAttr) {
            console.log('\n\n=== Billability Attribute ===');
            console.log(`ID: ${billabilityAttr.id}`);
            console.log(`Name: ${billabilityAttr.name}`);
            console.log(`Type: ${billabilityAttr.$type}`);
            console.log(`Sample value structure: ${JSON.stringify(billabilityAttr.value)}`);
        }
    }
    
    // Try to get attribute definition
    console.log('\n\n=== Getting Attribute Definition ===');
    const attrUrl = `${API_URL}/api/admin/customFieldSettings/customFields/284-26?fields=id,name,fieldType(id),localizedName`;
    
    const attrResponse = await fetch(attrUrl, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Accept': 'application/json'
        }
    });
    
    if (attrResponse.ok) {
        const attrDef = await attrResponse.json();
        console.log('Attribute definition:');
        console.log(JSON.stringify(attrDef, null, 2));
    } else {
        console.log('Could not fetch attribute definition');
    }
    
    // Get bundle/values for the attribute
    console.log('\n\n=== Getting Billability Values ===');
    const bundleUrl = `${API_URL}/api/admin/customFieldSettings/customFields/284-26?fields=id,name,bundle(id,values(id,name))`;
    
    const bundleResponse = await fetch(bundleUrl, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Accept': 'application/json'
        }
    });
    
    if (bundleResponse.ok) {
        const bundleDef = await bundleResponse.json();
        console.log('Billability bundle:');
        console.log(JSON.stringify(bundleDef, null, 2));
        
        if (bundleDef.bundle?.values) {
            console.log('\nAvailable values:');
            bundleDef.bundle.values.forEach(val => {
                console.log(`  - ${val.name} (ID: ${val.id})`);
            });
        }
    }
}

getBillabilityDetails();


import { YouTrackService } from './src/services/youtrack.js';

// Mock fetch
global.fetch = async (url, options) => {
    console.log(`Fetch called: ${url}`);
    console.log('Method:', options.method);
    if (options.body) {
        console.log('Body:', JSON.parse(options.body));
    }

    return {
        ok: true,
        json: async () => ({ id: '123-456', success: true }),
        text: async () => 'Success'
    };
};

async function runTest() {
    const service = new YouTrackService();

    // Test 1: Session WITHOUT billability (should have no attributes)
    console.log('\n--- Test 1: Session without Billability ---');
    const session1 = {
        taskName: 'Task No Billable',
        workDuration: 3600,
        startTime: new Date().toISOString(),
        description: 'No billability'
    };
    await service.addWorkItemFromSession(session1, 'TEST-1');

    // Test 2: Session WITH billability value but NO attribute ID (should catch warning and NOT send attributes)
    console.log('\n--- Test 2: Billability Value but NO ID (Should SKIP attributes) ---');
    const session2 = {
        taskName: 'Task Billable No ID',
        workDuration: 3600,
        startTime: new Date().toISOString(),
        description: 'Billable but uncertain',
        billabilityValue: { id: 'val_1', name: 'Billable' }
        // billabilityAttributeId missing
    };
    await service.addWorkItemFromSession(session2, 'TEST-2');

    // Test 3: Session WITH billability value AND ID (Should SEND attributes)
    console.log('\n--- Test 3: Billability Value AND ID (Should SEND attributes) ---');
    const session3 = {
        taskName: 'Task Billable With ID',
        workDuration: 3600,
        startTime: new Date().toISOString(),
        description: 'Billable verified',
        billabilityValue: { id: 'val_1', name: 'Billable' },
        billabilityAttributeId: 'CUSTOM-ATTR-ID'
    };
    await service.addWorkItemFromSession(session3, 'TEST-3');
}

runTest();

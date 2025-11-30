
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

    const session = {
        taskName: 'Test Task',
        workDuration: 3600, // 1 hour
        startTime: new Date('2023-10-27T10:00:00Z').toISOString(),
        description: 'My custom description',
        customFields: [
            { id: 'field_1', value: 'Value 1' },
            { id: 'field_2', value: 'Value 2' }
        ]
    };

    console.log('--- Testing addWorkItemFromSession ---');
    try {
        await service.addWorkItemFromSession(session, 'TEST-123');
        console.log('Test passed!');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

runTest();

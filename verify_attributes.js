
import { YouTrackService } from './src/services/youtrack.js';

// Mock fetch
global.fetch = async (url, options) => {
    console.log(`Fetch called: ${url}`);
    if (options && options.method) {
        console.log('Method:', options.method);
    }
    if (options && options.body) {
        console.log('Body:', JSON.parse(options.body));
    }

    // Mock response for work item attributes
    if (url.includes('workItemAttributes')) {
        return {
            ok: true,
            json: async () => ([
                {
                    id: 'attr_1',
                    name: 'Work Type',
                    values: [
                        { id: 'val_1', name: 'Development' },
                        { id: 'val_2', name: 'Testing' }
                    ]
                },
                {
                    id: 'attr_2',
                    name: 'Overtime',
                    values: [
                        { id: 'val_3', name: 'No' },
                        { id: 'val_4', name: 'Yes' }
                    ]
                }
            ])
        };
    }

    // Mock response for adding work item
    if (url.includes('workItems') && options && options.method === 'POST') {
        return {
            ok: true,
            json: async () => ({ id: '123-456', success: true }),
            text: async () => 'Success'
        };
    }

    return {
        ok: true,
        json: async () => ({}),
        text: async () => ''
    };
};

async function runTest() {
    const service = new YouTrackService();

    // Test fetching attributes
    console.log('--- Testing getWorkItemAttributes ---');
    const attributes = await service.getWorkItemAttributes('PROJ-1');
    console.log('Attributes fetched:', JSON.stringify(attributes, null, 2));

    // Test adding work item with attributes
    const session = {
        taskName: 'Test Task',
        workDuration: 3600,
        startTime: new Date('2023-10-27T10:00:00Z').toISOString(),
        description: 'Working on dynamic attributes',
        workItemAttributes: [
            { id: 'attr_1', value: { id: 'val_1' } }, // Work Type: Development
            { id: 'attr_2', value: { id: 'val_4' } }  // Overtime: Yes
        ]
    };

    console.log('\n--- Testing addWorkItemFromSession with Attributes ---');
    try {
        await service.addWorkItemFromSession(session, 'TEST-123');
        console.log('Test passed!');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

runTest();

import { YouTrackService } from '../services/youtrack.js';

// Mock fetch globally
global.fetch = jest.fn();

describe('YouTrackService', () => {
    let service;

    beforeEach(() => {
        service = new YouTrackService();
        fetch.mockClear();
    });

    describe('isAuthenticated', () => {
        test('returns true when configured', () => {
            expect(service.isAuthenticated()).toBe(true);
        });

        test('returns false when apiUrl is missing', () => {
            service.apiUrl = null;
            expect(service.isAuthenticated()).toBe(false);
        });

        test('returns false when token is missing', () => {
            service.token = null;
            expect(service.isAuthenticated()).toBe(false);
        });
    });

    describe('getAuthHeaders', () => {
        test('returns correct auth headers', () => {
            const headers = service.getAuthHeaders();
            expect(headers['Authorization']).toContain('Bearer');
            expect(headers['Content-Type']).toBe('application/json');
            expect(headers['Accept']).toBe('application/json');
        });
    });

    describe('testConnection', () => {
        test('returns success on valid response', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: 'user-1', name: 'Test User' })
            });

            const result = await service.testConnection();
            expect(result.success).toBe(true);
            expect(result.user).toBeDefined();
        });

        test('throws error on failed response', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: 'Unauthorized'
            });

            await expect(service.testConnection()).rejects.toThrow('Connection failed');
        });

        test('throws error when not configured', async () => {
            service.isConfigured = false;
            await expect(service.testConnection()).rejects.toThrow('YouTrack is not configured');
        });
    });

    describe('searchIssues', () => {
        test('returns mapped issues on success', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([
                    {
                        id: 'issue-1',
                        idReadable: 'PROJ-123',
                        summary: 'Test Issue',
                        project: { id: 'proj-1', name: 'Test Project' },
                        numberInProject: 123,
                        assignee: { name: 'John Doe' }
                    }
                ])
            });

            const results = await service.searchIssues('test');

            expect(results).toHaveLength(1);
            expect(results[0].idReadable).toBe('PROJ-123');
            expect(results[0].summary).toBe('Test Issue');
            expect(results[0].assignee).toBe('John Doe');
        });

        test('throws error on failed search', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Server Error'
            });

            await expect(service.searchIssues('test')).rejects.toThrow('Search failed');
        });
    });

    describe('getIssue', () => {
        test('returns issue on success', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    id: 'issue-1',
                    idReadable: 'PROJ-123',
                    summary: 'Test Issue'
                })
            });

            const issue = await service.getIssue('PROJ-123');
            expect(issue.idReadable).toBe('PROJ-123');
        });
    });

    describe('getWorkItemTypes', () => {
        test('returns work item types on success', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([
                    { id: 'type-1', name: 'Development' },
                    { id: 'type-2', name: 'Testing' }
                ])
            });

            const types = await service.getWorkItemTypes('project-1');

            expect(types).toHaveLength(2);
            expect(types[0].name).toBe('Development');
        });

        test('returns empty array on error', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                text: () => Promise.resolve('Not found')
            });

            const types = await service.getWorkItemTypes('nonexistent');
            expect(types).toEqual([]);
        });
    });

    describe('addWorkItem', () => {
        test('creates work item successfully', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: 'workitem-1' })
            });

            const result = await service.addWorkItem('PROJ-123', 45, 'Fixed bug');
            expect(result.id).toBe('workitem-1');
        });

        test('throws error for zero duration', async () => {
            await expect(service.addWorkItem('PROJ-123', 0)).rejects.toThrow('Duration must be greater than 0');
        });

        test('throws error for missing issue ID', async () => {
            await expect(service.addWorkItem('', 45)).rejects.toThrow('Issue ID is required');
        });
    });

    describe('addWorkItemFromSession', () => {
        test('creates work item from session object', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: 'workitem-1' })
            });

            const session = {
                startTime: new Date().toISOString(),
                workDuration: 2700, // 45 minutes in seconds
                description: 'Test work',
                taskName: 'PROJ-123 Fix bug'
            };

            const result = await service.addWorkItemFromSession(session, 'PROJ-123');
            expect(result.id).toBe('workitem-1');
        });

        test('throws error for missing start time', async () => {
            const session = { workDuration: 2700 };
            await expect(service.addWorkItemFromSession(session, 'PROJ-123')).rejects.toThrow('Session must have a startTime');
        });

        test('throws error for zero duration', async () => {
            const session = {
                startTime: new Date().toISOString(),
                workDuration: 0
            };
            await expect(service.addWorkItemFromSession(session, 'PROJ-123')).rejects.toThrow('Work duration is 0 minutes');
        });
    });

    describe('_fetch helper', () => {
        test('makes authenticated request', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: 'test' })
            });

            const result = await service._fetch('/api/test');

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/test'),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': expect.stringContaining('Bearer')
                    })
                })
            );
        });

        test('throws error when not authenticated', async () => {
            service.isConfigured = false;
            await expect(service._fetch('/api/test')).rejects.toThrow('YouTrack is not configured');
        });
    });
});

import { IssueAutocomplete } from '../components/issueAutocomplete.js';
import { youtrackService } from '../services/youtrack.js';

// Mock YouTrack service
jest.mock('../services/youtrack.js', () => ({
    youtrackService: {
        isAuthenticated: jest.fn(() => true),
        searchIssues: jest.fn(),
        getIssue: jest.fn()
    }
}));

describe('IssueAutocomplete', () => {
    let input;
    let autocomplete;
    let onSelect;

    beforeEach(() => {
        document.body.innerHTML = '<div><input id="test-input" /></div>';
        input = document.getElementById('test-input');
        onSelect = jest.fn();
        autocomplete = new IssueAutocomplete(input, onSelect);

        // Mock timers for debounce
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        autocomplete.destroy();
    });

    test('initializes correctly', () => {
        expect(document.querySelector('.issue-autocomplete-dropdown')).toBeTruthy();
        expect(autocomplete.isOpen).toBe(false);
    });

    test('debounces input handling', () => {
        const spy = jest.spyOn(autocomplete, 'searchIssues');

        autocomplete.handleInput('test');
        expect(spy).not.toHaveBeenCalled();

        jest.advanceTimersByTime(300);
        expect(spy).toHaveBeenCalledWith('test');
    });

    test('does not search for short queries', () => {
        const spy = jest.spyOn(autocomplete, 'searchIssues');

        autocomplete.handleInput('a');
        jest.advanceTimersByTime(300);

        expect(spy).not.toHaveBeenCalled();
    });

    test('caches search results', async () => {
        youtrackService.searchIssues.mockResolvedValue([{ id: 'TEST-1', summary: 'Test Issue' }]);

        // First search
        await autocomplete.searchIssues('cache-test');
        expect(youtrackService.searchIssues).toHaveBeenCalledTimes(1);

        // Second search with same query should hit cache (mocking handleInput logic)
        // We need to manually check the cache since it's private/internal to the module scope in the real file
        // But we can verify if searchIssues is NOT called again if we trigger handleInput

        // Reset mock to verify next call
        youtrackService.searchIssues.mockClear();

        // Trigger handleInput again
        await autocomplete.handleInput('cache-test');
        // Fast-forward any debounce (though cache hit should be immediate)
        jest.advanceTimersByTime(300);

        // Should NOT call service again
        expect(youtrackService.searchIssues).not.toHaveBeenCalled();
    });
});

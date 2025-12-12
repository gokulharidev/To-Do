import { escapeHtml } from '../utils/escapeHtml.js';

describe('escapeHtml Utility', () => {
    test('escapes HTML special characters', () => {
        expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });

    test('escapes ampersands', () => {
        expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    test('escapes quotes', () => {
        expect(escapeHtml('"quoted"')).toBe('"quoted"');
    });

    test('handles null input', () => {
        expect(escapeHtml(null)).toBe('');
    });

    test('handles undefined input', () => {
        expect(escapeHtml(undefined)).toBe('');
    });

    test('handles number input', () => {
        expect(escapeHtml(123)).toBe('123');
    });

    test('handles empty string', () => {
        expect(escapeHtml('')).toBe('');
    });

    test('preserves normal text', () => {
        expect(escapeHtml('Hello World')).toBe('Hello World');
    });
});

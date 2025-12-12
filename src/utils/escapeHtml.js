/**
 * Escape HTML special characters to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped HTML string
 */
export function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes all HTML tags and dangerous content
 */
export const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') return html;

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
};

/**
 * Escape special XML/HTML characters for safe display
 */
export const escapeHtml = (text) => {
  if (!text || typeof text !== 'string') return text;

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * Safe display text - removes HTML and escapes special characters
 */
export const safeText = (text) => {
  if (!text || typeof text !== 'string') return text;
  return escapeHtml(text.trim());
};

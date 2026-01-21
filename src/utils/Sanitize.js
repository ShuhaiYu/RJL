/**
 * HTML Sanitization Utility
 *
 * Provides safe HTML sanitization to prevent XSS attacks.
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} html - The HTML content to sanitize
 * @param {Object} options - DOMPurify configuration options
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHtml = (html, options = {}) => {
  if (!html) return '';

  const defaultOptions = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
    ALLOW_DATA_ATTR: false,
  };

  return DOMPurify.sanitize(html, { ...defaultOptions, ...options });
};

/**
 * Sanitize HTML and convert newlines to <br> tags
 * @param {string} text - The text content with potential newlines
 * @returns {string} - Sanitized HTML with <br> tags
 */
export const sanitizeWithLineBreaks = (text) => {
  if (!text) return '';

  // First sanitize, then replace newlines
  const sanitized = sanitizeHtml(text);
  return sanitized.replace(/\n/g, '<br />');
};

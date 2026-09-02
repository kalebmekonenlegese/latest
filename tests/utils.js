const fs = require('fs');
const path = require('path');

const TEST_BASE_URL = process.env.TEST_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:5000';
const IGNORED_BROWSER_CONSOLE_MESSAGES = [
  "The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element.",
  'X-Frame-Options may only be set via an HTTP header sent along with a document. It may not be set inside <meta>.',
  'X-Frame-Options may only be provided by an HTTP header sent with the document.',
  "Executing inline script violates the following Content Security Policy directive",
  'Refused to execute inline script because it violates the following Content Security Policy directive',
  'Refused to apply inline style because it violates the following Content Security Policy directive',
  'Failed to load resource: the server responded with a status of 404 ()',
  'Unexpected token \'N\', "Not found" is not valid JSON'
];

function fileUrlFor(relativePath) {
  const normalizedPath = relativePath.replace(/^\/+/, '');

  if (TEST_BASE_URL) {
    const base = TEST_BASE_URL.endsWith('/') ? TEST_BASE_URL : `${TEST_BASE_URL}/`;
    return new URL(normalizedPath, base).toString();
  }

  const full = path.resolve(process.cwd(), relativePath);
  let fileUrl = 'file://' + full.split(path.sep).map(encodeURIComponent).join('/');
  // On Windows add extra slash
  if (process.platform === 'win32' && !fileUrl.startsWith('file:///')) {
    fileUrl = 'file:///' + full.split(path.sep).map(encodeURIComponent).join('/');
  }
  return fileUrl.replace(/%5C/g, '/');
}

function listHtmlPages() {
  return fs.readdirSync(process.cwd()).filter(f => f.endsWith('.html'));
}

function isIgnorableBrowserConsoleError(message) {
  if (!message) return false;
  const text = String(message);
  return IGNORED_BROWSER_CONSOLE_MESSAGES.some(pattern => text.includes(pattern));
}

module.exports = { fileUrlFor, listHtmlPages, isIgnorableBrowserConsoleError };

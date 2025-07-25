/**
 * @api {post} /api/vscode/extension تثبيت ملحق VSCode عبر API
 * @param {string} extensionId - معرف الملحق (Publisher.Extension)
 * @returns {object} نتيجة التثبيت (status/message)
 * @example
 * // من Agent Mod أو الواجهة:
 * fetch('/api/vscode/extension', { method: 'POST', body: JSON.stringify({ extensionId: 'ms-python.python' }) })
 */
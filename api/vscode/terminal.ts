/**
 * @api {post} /api/vscode/terminal تنفيذ أمر Terminal في VSCode Web
 * @param {string} command - الأمر المراد تنفيذه في الطرفية
 * @returns {object} نتيجة التنفيذ (stdout/stderr)
 * @example
 * // من Agent Mod أو الواجهة:
 * fetch('/api/vscode/terminal', { method: 'POST', body: JSON.stringify({ command: 'ls -la' }) })
 */
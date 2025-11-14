function info(...args) { console.log('[Buddybot]', ...args); }
function warn(...args) { console.warn('[Buddybot][warn]', ...args); }
function err(...args) { console.error('[Buddybot][error]', ...args); }

module.exports = { info, warn, err };
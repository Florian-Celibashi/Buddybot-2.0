const fs = require('fs');
const { info, warn } = require('../logger');
const { LOG_PATH } = require('../config');
const { spawnBot, despawnBot, getBot } = require('../mc/bot');

function startLogWatcher(customPath) {
    const logPath = customPath || LOG_PATH;
    let offset = 0;

    if (!fs.existsSync(logPath)) {
        warn('Log file not found at', logPath);
        warn('Set LOG_PATH in .env if your server logs are elsewhere.');
    } else {
        offset = fs.statSync(logPath).size;
        info('Tailing log:', logPath);
    }

    const POLL_MS = 500;
    const timer = setInterval(() => {
        try {
            if (!fs.existsSync(logPath)) return;
            const stat = fs.statSync(logPath);
            if (stat.size < offset) offset = 0;
            if (stat.size > offset) {
                const stream = fs.createReadStream(logPath, { start: offset, end: stat.size - 1, encoding: 'utf8' });
                let buf = '';
                stream.on('data', chunk => { buf += chunk; });
                stream.on('end', () => {
                    offset = stat.size;
                    const lines = buf.split(/\r?\n/);
                    for (const line of lines) {
                        if (!line) continue;
                        const chatMatch = line.match(/: <([^>]+)>\s+(.+)$/);
                        if (!chatMatch) continue;
                        const msg = chatMatch[2].trim();
                        if (msg === '!spawn') {
                            info('Spawn command detected in chat.');
                            spawnBot();
                        } else if (msg === '!despawn') {
                            info('Despawn command detected in chat.');
                            despawnBot();
                        }
                    }
                });
            }
        } catch (e) {
            warn('Watcher error:', e && e.message ? e.message : e);
        }
    }, POLL_MS);

    const shutdown = () => { clearInterval(timer); try { despawnBot(); } catch (_) { } process.exit(0); };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

module.exports = { startLogWatcher };
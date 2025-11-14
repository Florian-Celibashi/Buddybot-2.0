// src/main.js
const { info } = require('./logger');
const { LOG_PATH, MC_HOST, MC_PORT, BOT_USERNAME } = require('./config');
const { startLogWatcher } = require('./infra/logWatcher');

function start() {
    info('Passive controller running. Use in-game chat as ADMIN: !spawn / !despawn');
    info('Host:', MC_HOST, 'Port:', MC_PORT, 'Bot:', BOT_USERNAME);
    startLogWatcher(LOG_PATH); // start the real watcher
}

module.exports = { start };
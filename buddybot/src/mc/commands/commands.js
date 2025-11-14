const { startFollow } = require('../follow');
const { startAssist } = require('../assist');
// src/mc/commands/commands.js

/**
 * Handle chat commands like !follow, !assist, !despawn.
 * Returns true if a command was recognized and handled, false otherwise.
 */
function handleCommand(bot, username, msg, despawnBot) {
    // Normalize message (trim + lowercase copy for comparisons if needed)
    const raw = msg;
    const text = msg.trim();

    if (text.startsWith('!follow')) {
        startFollow(bot, username);
        return true;
    }

    if (text.startsWith('!assist')) {
        startAssist(bot, username);
        return true;
    }

    if (text === '!despawn') {
        if (typeof despawnBot === 'function') {
            despawnBot();
        }
        return true;
    }

    // Default: not handled
    return false;
}

module.exports = {
    handleCommand,
};

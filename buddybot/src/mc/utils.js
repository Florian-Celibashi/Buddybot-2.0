const { warn } = require('../logger');

function safeChat(bot, message) {
    if (!bot || typeof bot.chat !== 'function' || !message) {
        return false;
    }

    try {
        bot.chat(message);
        return true;
    } catch (e) {
        warn('Failed to send chat message:', e && e.message ? e.message : e);
        return false;
    }
}

module.exports = {
    safeChat,
};

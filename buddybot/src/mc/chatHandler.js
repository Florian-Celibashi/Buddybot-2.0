const { warn } = require('../logger');
const { addMessage, getHistory } = require('../ai/memory');
const { generateAIReply } = require('../ai/responder');
const { shouldReplyToMessage } = require('./triggers');
const { handleCommand } = require('./commands/commands');
const { safeChat } = require('./utils');

function createChatHandler({ bot, botUsername, cooldownMs, despawnBot }) {
    const userCooldown = new Map();

    async function processChat(username, msg) {
        addMessage(username, 'user', msg);
        const history = getHistory(username);
        const reply = await generateAIReply(username, msg, history);
        if (reply && bot) {
            safeChat(bot, reply);
            addMessage(username, 'assistant', reply);
        }
    }

    return function onChat(username, message) {
        const msg = String(message || '').trim();
        if (!msg) return;

        if (username === botUsername) return;

        if (handleCommand(bot, username, msg, despawnBot)) {
            return;
        }

        if (!shouldReplyToMessage(msg, botUsername)) return;

        const nowTs = Date.now();
        const last = userCooldown.get(username) || 0;
        if (nowTs - last < cooldownMs) return;
        userCooldown.set(username, nowTs);

        processChat(username, msg).catch((e) => {
            warn('Failed to process chat message:', e && e.message ? e.message : e);
        });
    };
}

module.exports = { createChatHandler };

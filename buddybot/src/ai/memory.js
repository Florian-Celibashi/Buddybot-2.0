// src/ai/memory.js
const conversations = new Map(); // username -> [{ role, content }]

function addMessage(username, role, content) {
    if (!conversations.has(username)) {
        conversations.set(username, []);
    }
    const history = conversations.get(username);
    history.push({ role, content });

    // keep only last 10–20 messages to avoid huge context
    const MAX = 20;
    if (history.length > MAX) {
        history.splice(0, history.length - MAX);
    }
}

function getHistory(username) {
    return conversations.get(username) || [];
}

module.exports = { addMessage, getHistory };
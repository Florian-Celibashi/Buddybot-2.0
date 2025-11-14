require('dotenv').config();
const path = require('path');

module.exports = {
    BOT_USERNAME: process.env.BOT_USERNAME || 'Buddybot',
    MC_HOST: process.env.MC_HOST || 'localhost',
    MC_PORT: Number(process.env.MC_PORT || 25565),

    // OpenAI
    OPENAI_KEY: process.env.OPENAI_5O_API_KEY || process.env.OPENAI_API_KEY || '',
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-5.1',
    OPENAI_FALLBACKS: ['gpt-4o-mini', 'gpt-4o'],

    // Chat + spam control
    USER_COOLDOWN_MS: 2500,
    SYSTEM_PROMPT:
        "You are Buddybot, a friendly Minecraft helper. Be concise (<=1-2 sentences). " +
        "Answer only what is asked. Avoid special characters Minecraft may not render.",
    MAX_CHAT_LEN: 240,

    // Spawning + log tailing
    SPAWN_COOLDOWN_MS: 2000,
    LOG_PATH: process.env.LOG_PATH
        || path.resolve(__dirname, '../../mc-server/logs/latest.log'),
};
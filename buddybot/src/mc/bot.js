const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals: { GoalFollow } } = require('mineflayer-pathfinder');
const minecraftData = require('minecraft-data');
const { plugin: pvp } = require('mineflayer-pvp');
const { addMessage, getHistory } = require('../ai/memory');

const { info, warn, err } = require('../logger');
const { BOT_USERNAME, MC_HOST, MC_PORT, USER_COOLDOWN_MS, SPAWN_COOLDOWN_MS } = require('../config');
const { generateAIReply } = require('../ai/responder');
const { shouldReplyToMessage } = require('./triggers');
const { handleCommand } = require('./commands/commands');
const { handleEntityHurt } = require('./assist');
const { startFollow } = require('./follow');

let botRef = null;
let lastSpawnAt = 0;
const userCooldown = new Map();

function spawnBot() {
    const now = Date.now();
    if (botRef) { info('Spawn requested but bot is already online.'); return botRef; }
    if (now - lastSpawnAt < SPAWN_COOLDOWN_MS) { info('Spawn debounced.'); return botRef; }
    lastSpawnAt = now;

    info('Spawning...');
    const bot = mineflayer.createBot({
        host: MC_HOST,
        port: MC_PORT,
        username: BOT_USERNAME,
    });

    // Enable pathfinding plugin so we can use !follow
    bot.loadPlugin(pathfinder);
    try {
        const mcData = minecraftData(bot.version);
        const defaultMove = new Movements(bot, mcData);
        bot.pathfinder.setMovements(defaultMove);
    } catch (e) {
        warn('Failed to initialize pathfinder movements:', e && e.message ? e.message : e);
    }

    // Enable PVP plugin so we can use !assist
    try {
        bot.loadPlugin(pvp);
    } catch (e) {
        warn('Failed to load PVP plugin:', e && e.message ? e.message : e);
    }

    bot.on('login', () => info('Bot logged in as', BOT_USERNAME));
    bot.on('spawn', () => info('Bot has spawned in the world.'));
    bot.on('kicked', (reason) => warn('Bot kicked:', reason));
    bot.on('end', () => { info('Bot connection ended.'); botRef = null; });
    bot.on('error', (e) => err('Bot error:', e && e.message ? e.message : e));

    bot.on('chat', (username, message) => {
        const msg = String(message || '').trim();

        // Ignore our own messages
        if (username === BOT_USERNAME) return;

        // First, try to handle explicit commands like !follow / !assist / !despawn
        if (handleCommand(bot, username, msg, despawnBot)) {
            // Command recognized and handled; do not send message to AI
            return;
        }

        if (!shouldReplyToMessage(msg, BOT_USERNAME)) return;

        const last = userCooldown.get(username) || 0;
        const nowTs = Date.now();
        if (nowTs - last < USER_COOLDOWN_MS) return;
        userCooldown.set(username, nowTs);

        (async () => {
            // Record the player's message into per-user memory
            addMessage(username, 'user', msg);

            // Retrieve recent history for this player
            const history = getHistory(username);

            const reply = await generateAIReply(username, msg, history);
            if (reply && botRef) {
                try {
                    // Send reply in chat
                    bot.chat(reply);
                    // Record bot's response in memory
                    addMessage(username, 'assistant', reply);
                } catch (e) {
                    warn('Failed to send chat reply:', e && e.message ? e.message : e);
                }
            }
        })();
    });

    bot.on('entityHurt', (entity) => {
        handleEntityHurt(bot, entity);
    });

    botRef = bot;
    return botRef;
}

function despawnBot() {
    if (!botRef) { info('Despawn requested but bot is not online.'); return; }
    info('Despawning...');
    try { botRef.end('Manual despawn'); }
    catch (e) { warn('Error calling bot.end:', e && e.message ? e.message : e); }
    finally { botRef = null; }
}

function getBot() { return botRef; }

module.exports = { spawnBot, despawnBot, getBot };
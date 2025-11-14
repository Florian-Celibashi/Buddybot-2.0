const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const minecraftData = require('minecraft-data');
const { plugin: pvp } = require('mineflayer-pvp');

const { info, warn, err } = require('../logger');
const {
    BOT_USERNAME,
    MC_HOST,
    MC_PORT,
    USER_COOLDOWN_MS,
    SPAWN_COOLDOWN_MS,
} = require('../config');
const { handleEntityHurt, handleStoppedAttacking } = require('./assist');
const { createChatHandler } = require('./chatHandler');

let botRef = null;
let lastSpawnAt = 0;

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

    initializePathfinder(bot);
    initializePvp(bot);

    const chatHandler = createChatHandler({
        bot,
        botUsername: BOT_USERNAME,
        cooldownMs: USER_COOLDOWN_MS,
        despawnBot,
    });
    const entityHurtHandler = (entity) => handleEntityHurt(bot, entity);

    bot.on('login', () => info('Bot logged in as', BOT_USERNAME));
    bot.on('spawn', () => info('Bot has spawned in the world.'));
    bot.on('kicked', (reason) => warn('Bot kicked:', reason));
    bot.on('error', (e) => err('Bot error:', e && e.message ? e.message : e));
    bot.on('end', () => {
        info('Bot connection ended.');
        bot.removeListener('chat', chatHandler);
        bot.removeListener('entityHurt', entityHurtHandler);
        botRef = null;
    });

    bot.on('chat', chatHandler);
    bot.on('entityHurt', entityHurtHandler);
    bot.on('stoppedAttacking', (target) => handleStoppedAttacking(bot, target));

    botRef = bot;
    return botRef;
}

function initializePathfinder(bot) {
    try {
        bot.loadPlugin(pathfinder);
        const mcData = minecraftData(bot.version);
        const defaultMove = new Movements(bot, mcData);
        bot.pathfinder.setMovements(defaultMove);
    } catch (e) {
        warn('Failed to initialize pathfinder movements:', e && e.message ? e.message : e);
    }
}

function initializePvp(bot) {
    try {
        bot.loadPlugin(pvp);
    } catch (e) {
        warn('Failed to load PVP plugin:', e && e.message ? e.message : e);
    }
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

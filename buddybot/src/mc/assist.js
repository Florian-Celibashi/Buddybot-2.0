// src/mc/assist.js

const { warn } = require('../logger');
const { safeChat } = require('./utils');

/**
 * Assist (combat support) behavior helpers for Buddybot.
 * These functions manage assist-related state on the bot instance.
 */

function startAssist(bot, username) {
    if (!bot || !username) return;

    // Set assist state
    bot.assisting = username;
    bot.assistingTimeout = null;
    bot.assistingTimeoutTicks = 0;

    // Give feedback in chat
    safeChat(bot, `Okay, ${username}, I will assist you.`);

    if (!bot.pvp) {
        warn('!assist requested but PVP plugin is not available on bot.');
    }
}

function stopAssist(bot) {
    if (!bot) return;

    bot.assisting = null;
    bot.assistingTimeout = null;
    bot.assistingTimeoutTicks = 0;
}

/**
 * Handle entityHurt events and attack mobs that are threatening the assisted player.
 */
function handleEntityHurt(bot, entity) {
    const assistTarget = bot.assisting;
    if (!assistTarget) return;
    if (!bot.pvp) return;

    const assistedPlayer =
        bot.players[assistTarget] && bot.players[assistTarget].entity;
    if (!assistedPlayer || !assistedPlayer.position) return;

    if (!entity || !entity.position) return;

    let targetMob = null;

    // Case 1: assisted player is the one who got hurt -> find nearest mob around them
    if (entity === assistedPlayer) {
        const mobs = Object.values(bot.entities).filter((e) => {
            return e.type === 'mob' && e.position && e !== bot.entity;
        });

        if (!mobs.length) return;

        let nearest = null;
        let nearestDist = Infinity;
        for (const m of mobs) {
            const dist = m.position.distanceTo(assistedPlayer.position);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = m;
            }
        }

        if (!nearest || nearestDist > 10) return; // too far, ignore
        targetMob = nearest;
    }
    // Case 2: a mob got hurt near the assisted player -> assume assisted is attacking it
    else if (entity.type === 'mob') {
        const distToPlayer = entity.position.distanceTo(assistedPlayer.position);
        if (distToPlayer > 10) return; // ignore mobs far away
        targetMob = entity;
    }

    if (!targetMob) return;

    try {
        bot.pvp.attack(targetMob);
    } catch (e) {
        warn('Error starting assist attack:', e && e.message ? e.message : e);
    }
}

module.exports = {
    startAssist,
    stopAssist,
    handleEntityHurt,
};

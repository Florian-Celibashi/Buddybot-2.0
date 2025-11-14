// src/mc/assist.js

const { warn } = require('../logger');
const { safeChat } = require('./utils');
const { goals: { GoalFollow } } = require('mineflayer-pathfinder');

/**
 * Assist (combat support) behavior helpers for Buddybot.
 * These functions manage assist-related state on the bot instance.
 */

function startAssist(bot, username) {
    if (!bot || !username) return;

    // If we're already assisting this player, treat !assist as a toggle to turn it off
    if (bot.assisting === username) {
        safeChat(bot, `Okay, ${username}, I'll stop assisting you.`);
        stopAssist(bot);
        return;
    }

    // If we were assisting someone else, let the user know we're switching
    if (bot.assisting && bot.assisting !== username) {
        safeChat(bot, `Okay, I'll switch to assisting ${username} instead of ${bot.assisting}.`);
    } else {
        safeChat(bot, `Okay, ${username}, I will assist you.`);
    }

    // Set assist state
    bot.assisting = username;
    bot.assistingTimeout = null;
    bot.assistingTimeoutTicks = 0;

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
    if (!bot || !entity) return;

    // --- Always-on self-defense: if Buddybot is hurt, attack the nearest attacker ---
    // Allow turning this off later by setting bot.autoDefend = false
    if (entity === bot.entity && bot.autoDefend !== false) {
        try {
            const attacker = bot.nearestEntity((e) => {
                if (!e || e === bot.entity || !e.position || !bot.entity || !bot.entity.position) return false;
                const dist = e.position.distanceTo(bot.entity.position);
                const isMob = e.type === 'mob';
                const isPlayer = e.type === 'player';
                // If friendly fire is enabled, don't retaliate against players, only mobs
                if (bot.friendlyFire && isPlayer) return false;
                // Treat nearby mobs (and players when friendly fire is off) as potential attackers
                return dist < 4 && (isMob || isPlayer);
            });

            if (attacker && bot.pvp && typeof bot.pvp.attack === 'function') {
                bot.pvp.attack(attacker);
            }
        } catch (e) {
            warn('Error starting self-defense attack:', e && e.message ? e.message : e);
        }
        // we don't return here; assist logic can still run below if needed
    }

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

/**
 * Called when the bot stops attacking (from mineflayer-pvp).
 * If the bot was following someone before or during combat,
 * automatically resume following that player.
 */
function handleStoppedAttacking(bot, target) {
    if (!bot) return;

    // If we're in follow mode, re-apply a follow goal on the same player
    const username = bot.following;
    if (username && bot.pathfinder) {
        const player = bot.players[username] && bot.players[username].entity;
        if (!player) return;

        try {
            const goal = new GoalFollow(player, 1);
            bot.pathfinder.setGoal(goal, true);
        } catch (e) {
            warn('Error resuming follow after assist attack:', e && e.message ? e.message : e);
        }
    }
}

module.exports = {
    startAssist,
    stopAssist,
    handleEntityHurt,
    handleStoppedAttacking,
};

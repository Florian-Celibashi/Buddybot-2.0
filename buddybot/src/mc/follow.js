// src/mc/follow.js

const { goals: { GoalFollow } } = require('mineflayer-pathfinder');
const { warn } = require('../logger');
const { safeChat } = require('./utils');

/**
 * Follow behavior helpers for Buddybot.
 * These functions manage follow-related state on the bot instance.
 */

function startFollow(bot, username) {
    if (!bot || !username) return;

    if (!bot.pathfinder) {
        warn('!follow used but pathfinder plugin is not available on bot.');
        return;
    }

    // If we're already following this player, stop following them
    if (bot.following === username) {
        stopFollow(bot);
        safeChat(bot, "Okay, I'll stop following you.");
        return;
    }

    // Give feedback in chat
    safeChat(bot, `Okay, ${username}, I will follow you.`);

    const player = bot.players[username];
    if (!player || !player.entity) {
        safeChat(bot, "I can't see you well enough to follow you right now.");
        return;
    }

    try {
        const goal = new GoalFollow(player.entity, 1); // stay ~1 block away
        bot.pathfinder.setGoal(goal, true); // dynamic follow
        bot.following = username;
        bot.followingTimeout = null;
        bot.followingTimeoutTicks = 0;
    } catch (e) {
        warn('Error setting follow goal:', e && e.message ? e.message : e);
    }
}

function stopFollow(bot) {
    if (!bot) return;

    try {
        if (bot.pathfinder) {
            bot.pathfinder.setGoal(null);
        }
    } catch (e) {
        warn('Error stopping follow goal:', e && e.message ? e.message : e);
    }

    bot.following = null;
    bot.followingTimeout = null;
    bot.followingTimeoutTicks = 0;
}

module.exports = {
    startFollow,
    stopFollow,
};

const { startFollow } = require('../follow');
const { startAssist } = require('../assist');
// src/mc/commands/commands.js

// Legacy fallback messages in case the API is unavailable
const friendlyFireOnMessages = [
    (name) =>
        `Even good allies clash blades by accident, ${name}. If it happens again, I'll stand my ground without striking back.`,
    (name) =>
        `Battle gets messy, ${name}. If your sword clips me, I'll trust it's a friendly swing and stay my hand.`,
    (name) =>
        `I know you don't mean every hit, ${name}. I'll endure your stray blows without fighting back.`,
];

const friendlyFireOffMessages = [
    (name) =>
        `A duel, then, ${name}? If you strike me now, I'll answer with steel as your worthy opponent.`,
    (name) =>
        `So the training wheels are off, ${name}. If your blade finds me, mine will find you in return.`,
    (name) =>
        `Very well, ${name}. From this moment, if you test my armor, I'll test yours right back.`,
];

/**
 * Pick a legacy hard-coded line if the API is not available or fails.
 */
function getFallbackFriendlyFireLine(username, isOn) {
    const pool = isOn ? friendlyFireOnMessages : friendlyFireOffMessages;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return typeof pick === 'function' ? pick(username) : String(pick);
}

/**
 * Use the ChatGPT API to generate a funny, slightly over-the-top role-play line
 * for when friendly fire is toggled.
 *
 * This is fire-and-forget: callers should not await this to keep the
 * command handler synchronous.
 */
async function generateFriendlyFireLine(username, isOn) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_TOKEN;
    if (!apiKey) {
        // No API key configured; fall back to hard-coded lines.
        return getFallbackFriendlyFireLine(username, isOn);
    }

    const stateDescription = isOn
        ? 'ON – Buddybot will now ignore accidental hits from allies and will NOT fight back when you accidentally hit him.'
        : 'OFF – Buddybot will now treat incoming hits as a duel and WILL fight back if attacked.';

    const systemPrompt = `You are Buddybot, a heroic but slightly over-the-top Minecraft companion.
Speak in short, in-game-friendly lines (1–2 sentences max).
Be playful, a bit dramatic, maybe overly serious in a funny way, but still clearly informative.
You are responding in Minecraft chat to a player who just toggled the friendly-fire setting.`;

    const userPrompt = `Friendly fire was just toggled ${isOn ? 'ON' : 'OFF'} by player "${username}".
State now: ${stateDescription}.
Write ONE short line that:
- Addresses the player by name (${username})
- Sounds like a role-play / heroic companion speaking
- Is a little dramatic or overly serious in a funny way
- Clearly hints at whether Buddybot will ignore hits (if ON) or fight back (if OFF).
Do NOT add quotation marks around the line.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4.1-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                max_tokens: 80,
                temperature: 0.8,
            }),
        });

        if (!response.ok) {
            console.error('ChatGPT friendlyFire request failed with status:', response.status, await response.text());
            return getFallbackFriendlyFireLine(username, isOn);
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content?.trim();
        if (!content) {
            return getFallbackFriendlyFireLine(username, isOn);
        }

        return content;
    } catch (err) {
        console.error('Error calling ChatGPT friendlyFire:', err);
        return getFallbackFriendlyFireLine(username, isOn);
    }
}

/**
 * Handle chat commands like !follow, !assist, !despawn.
 * Returns true if a command was recognized and handled, false otherwise.
 */
function handleCommand(bot, username, msg, despawnBot) {
    // Normalize message (trim + lowercase copy for comparisons if needed)
    const raw = msg; // keep raw in case we ever need it
    const text = msg.trim();

    if (text.startsWith('!follow')) {
        startFollow(bot, username);
        return true;
    }

    if (text.startsWith('!assist')) {
        startAssist(bot, username);
        return true;
    }

    if (text.startsWith('!friendlyfire')) {
        // Toggle the flag first
        bot.friendlyFire = !bot.friendlyFire;
        const isOn = bot.friendlyFire;

        // Fire-and-forget ChatGPT call; we don't await this so the
        // command handler stays synchronous for the rest of the system.
        generateFriendlyFireLine(username, isOn)
            .then((line) => {
                if (line && typeof bot.chat === 'function') {
                    bot.chat(line);
                }
            })
            .catch((err) => {
                console.error('Unexpected error generating friendlyFire line:', err);
                // As a last resort, try a fallback line.
                const fallback = getFallbackFriendlyFireLine(username, isOn);
                if (fallback && typeof bot.chat === 'function') {
                    bot.chat(fallback);
                }
            });

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

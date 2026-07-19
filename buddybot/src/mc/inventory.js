const { warn } = require('../logger');
const { safeChat } = require('./utils');

function summarizeInventory(items, maxEntries = 6) {
    if (!Array.isArray(items) || items.length === 0) {
        return 'My inventory is empty.';
    }

    const totals = new Map();
    for (const item of items) {
        if (!item) continue;
        const name = item.displayName || item.name || 'Unknown item';
        const count = Number.isFinite(item.count) ? item.count : 1;
        totals.set(name, (totals.get(name) || 0) + count);
    }

    const entries = [...totals.entries()];
    if (entries.length === 0) return 'My inventory is empty.';

    const visible = entries
        .slice(0, maxEntries)
        .map(([name, count]) => `${count}x ${name}`);
    const remaining = entries.length - visible.length;
    const suffix = remaining > 0 ? `, plus ${remaining} more item type${remaining === 1 ? '' : 's'}` : '';

    return `Inventory: ${visible.join(', ')}${suffix}.`;
}

function reportInventory(bot) {
    if (!bot || !bot.inventory || typeof bot.inventory.items !== 'function') {
        warn('!inventory requested before inventory data was available.');
        return false;
    }

    return safeChat(bot, summarizeInventory(bot.inventory.items()));
}

module.exports = { reportInventory, summarizeInventory };

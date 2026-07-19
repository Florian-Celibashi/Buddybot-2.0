const test = require('node:test');
const assert = require('node:assert/strict');

const { reportInventory, summarizeInventory } = require('../src/mc/inventory');

test('inventory summary aggregates matching item names', () => {
    const result = summarizeInventory([
        { displayName: 'Oak Log', count: 3 },
        { displayName: 'Oak Log', count: 2 },
        { displayName: 'Bread', count: 4 },
    ]);

    assert.equal(result, 'Inventory: 5x Oak Log, 4x Bread.');
});

test('inventory report sends the summary through bot chat', () => {
    const messages = [];
    const bot = {
        inventory: { items: () => [{ name: 'diamond', count: 2 }] },
        chat: (message) => messages.push(message),
    };

    assert.equal(reportInventory(bot), true);
    assert.deepEqual(messages, ['Inventory: 2x diamond.']);
});

test('empty inventory produces a clear message', () => {
    assert.equal(summarizeInventory([]), 'My inventory is empty.');
});

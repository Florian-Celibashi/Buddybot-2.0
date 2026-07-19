const test = require('node:test');
const assert = require('node:assert/strict');

const { handleCommand } = require('../src/mc/commands/commands');

test('inventory command is recognized and reports current items', () => {
    const messages = [];
    const bot = {
        inventory: { items: () => [{ displayName: 'Torch', count: 12 }] },
        chat: (message) => messages.push(message),
    };

    assert.equal(handleCommand(bot, 'Player', '!inventory', () => {}), true);
    assert.deepEqual(messages, ['Inventory: 12x Torch.']);
});

test('command prefixes do not accidentally trigger commands', () => {
    const bot = {};

    assert.equal(handleCommand(bot, 'Player', '!followme', () => {}), false);
    assert.equal(handleCommand(bot, 'Player', '!assistant', () => {}), false);
    assert.equal(handleCommand(bot, 'Player', '!friendlyfireoff', () => {}), false);
});

const test = require('node:test');
const assert = require('node:assert/strict');

const { addMessage, getHistory } = require('../src/ai/memory');

test('conversation memory keeps only the 20 newest messages', () => {
    const username = `memory-test-${Date.now()}`;

    for (let index = 0; index < 25; index += 1) {
        addMessage(username, 'user', `message-${index}`);
    }

    const history = getHistory(username);
    assert.equal(history.length, 20);
    assert.equal(history[0].content, 'message-5');
    assert.equal(history.at(-1).content, 'message-24');
});

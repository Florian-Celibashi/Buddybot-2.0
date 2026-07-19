const test = require('node:test');
const assert = require('node:assert/strict');

const { shouldReplyToMessage } = require('../src/mc/triggers');

test('reply trigger matches Buddybot mentions case-insensitively', () => {
    assert.equal(shouldReplyToMessage('@BuddyBot help me', 'Buddybot'), true);
    assert.equal(shouldReplyToMessage('@bb follow me', 'Buddybot'), true);
});

test('reply trigger ignores unrelated chat and partial names', () => {
    assert.equal(shouldReplyToMessage('hello everyone', 'Buddybot'), false);
    assert.equal(shouldReplyToMessage('@Buddybotics hello', 'Buddybot'), false);
});

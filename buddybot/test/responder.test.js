const test = require('node:test');
const assert = require('node:assert/strict');

const { mcTrunc } = require('../src/ai/responder');


test('mcTrunc normalizes whitespace', () => {
    assert.equal(mcTrunc('  hello\n   minecraft  '), 'hello minecraft');
});

test('mcTrunc respects the configured limit', () => {
    const result = mcTrunc('abcdefghij', 6);

    assert.equal(result.length, 6);
    assert.equal(result, 'abcde…');
});

test('mcTrunc handles empty values', () => {
    assert.equal(mcTrunc(null), '');
    assert.equal(mcTrunc(''), '');
});

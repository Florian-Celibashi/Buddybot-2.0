// src/ai/client.js
const { warn } = require('../logger');
const { OPENAI_KEY, OPENAI_MODEL, OPENAI_FALLBACKS } = require('../config');

let openai = null;
let OpenAI = null;

try {
    ({ OpenAI } = require('openai'));
    if (OPENAI_KEY) {
        openai = new OpenAI({ apiKey: OPENAI_KEY });
    } else {
        warn(
            'No OPENAI_5O_API_KEY or OPENAI_API_KEY found in .env — chat replies disabled until set.'
        );
    }
} catch (e) {
    warn('`openai` package not installed. Run `npm i openai` to enable AI replies.');
}

function isReady() {
    return !!openai;
}

function getClient() {
    return openai;
}

function getModelCandidates() {
    return [OPENAI_MODEL, ...OPENAI_FALLBACKS];
}

module.exports = {
    isReady,
    getClient,
    getModelCandidates,
};
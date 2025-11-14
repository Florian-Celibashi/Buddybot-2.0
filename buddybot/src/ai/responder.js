const { info, warn } = require('../logger');
const { MAX_CHAT_LEN, SYSTEM_PROMPT } = require('../config');
const { isReady, getClient, getModelCandidates } = require('./client');


function mcTrunc(s, max = MAX_CHAT_LEN) {
    if (!s) return '';
    s = String(s).replace(/\s+/g, ' ').trim();
    return s.length <= max ? s : s.slice(0, max - 1) + '…';
}

async function generateAIReply(username, message, history) {
    if (!isReady()) return null;
    const openai = getClient();
    const candidates = getModelCandidates();
    let lastErr = null;

    for (const model of candidates) {
        try {
            info('Calling OpenAI model:', model);
            const messages = [
                { role: 'system', content: SYSTEM_PROMPT },
                ...(Array.isArray(history) ? history : []),
                { role: 'user', content: `Player ${username}: ${message}` }
            ];
            const res = await openai.responses.create({
                model,
                input: messages
            });

            const output = res.output_text
                || (res.choices && res.choices[0] && res.choices[0].message && res.choices[0].message.content)
                || '';
            info('OpenAI reply (pre-trunc):', (output || '').slice(0, 120));
            return mcTrunc(output);
        } catch (e) {
            lastErr = e;
            const msg = (e && e.message) ? e.message : String(e);
            warn('OpenAI error with model', model + ':', msg);
            // Continue if “does not exist”, otherwise stop
            if (/does not exist/i.test(msg)) continue;
            break;
        }
    }
    warn('All OpenAI model attempts failed.', lastErr && lastErr.message ? lastErr.message : lastErr);
    return null;
}

module.exports = { generateAIReply, mcTrunc };
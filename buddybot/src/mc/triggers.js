function shouldReplyToMessage(msg, botUsername) {
    const lower = String(msg || '').trim().toLowerCase();
    return (
        lower.startsWith('@' + botUsername.toLowerCase() + ' ') ||
        lower.startsWith('@bb ')
    );
}

module.exports = { shouldReplyToMessage };
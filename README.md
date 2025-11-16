# BuddyBot 🤖  
_A GPT-powered companion for your Minecraft server_

Buddybot is an AI-driven Minecraft companion that uses OpenAI’s latest models to answer your in-game questions and fight by your side.

- Game AI
- LLM-driven behavior
- Node.js + Mineflayer + OpenAI API integration

---

## ✨ Features

- **Self-Defense** - Buddybot automatically retaliates against any entity that attacks him.
  
- **Follow mode toggle** – `!follow`  
  BuddyBot locks onto a player and follows them around, pathfinding around blocks and obstacles.
  When enabled, Buddybot intelligently breaks or places blocks as needed to navigate the terrain and reach the player.

- **Assist mode toggle** – `!assist`  
  When enabled, Buddybot joins the fight: he attacks any mob player attacks, as well as any mob that attacks the player.

- **Friendly fire toggle** – `!friendlyfire`  
  Switch between:
  - _“Ignore friendly damage”_ (shrugs off accidental hits / playful punches)
  - _“Duel mode”_ (buddybot will fight back against any player who attacks him)

- **Spawn commands** – `!spawn`, `!despawn`
  Start/quit the bot cleanly from Minecraft chat (exact commands can be tweaked in `commands.js`).

- **LLM-powered chat** – Talk to BuddyBot in Minecraft chat
  BuddyBot uses OpenAI’s latest language models to answer your in-game questions instantly. Ask about crafting recipes, mob behavior,
  redstone logic, or general gameplay tips — BuddyBot provides fast, accurate help to players without having to leave the game.
  Just make sure to start your message with @bb or @buddybot to get his attention.

- **Modular command system**  
  Commands like follow/assist/friendlyfire are split into their own modules, making it easy to add new ones.

---

## 🧱 Tech Stack

Runtime & Target – Node.js (CommonJS), launched with npm start (node index.js), designed for a Minecraft Java server (tested with 1.16.5).
Key Libraries – Mineflayer (bot), mineflayer-pathfinder (navigation), mineflayer-pvp (combat), minecraft-data (version metadata), dotenv (config), and the OpenAI SDK        for chat replies.
Configuration (env vars) –
BOT_USERNAME – Minecraft login name (default: "Buddybot").
MC_HOST, MC_PORT – Minecraft server address.
OPENAI_5O_API_KEY or OPENAI_API_KEY – OpenAI credentials.
OPENAI_MODEL – Preferred model name; code falls back if unavailable.
LOG_PATH – Path to the Minecraft log to watch (default: mc-server/logs/latest.log).

## 🏗 Architecture Overview
Startup & Lifecycle – npm start → node index.js → start() in src/main.js. A log watcher tails mc-server/logs/latest.log 
and spawns/despawns the Mineflayer bot when players type !spawn / !despawn, so the bot only runs on demand.
Command Handling – Chat lines go through createChatHandler, which runs handleCommand (!follow, !assist, !friendlyfire, !despawn), 
checks mentions (@botname / @bb), and enforces per-user cooldowns. Follow uses GoalFollow, assist wires in combat/self-defense, 
and friendly-fire toggles a boolean that changes how the bot reacts to player hits.
LLM Integration – On a valid mention, the handler logs the message in memory.js, builds a prompt (system prompt + history + latest user line),
and calls the OpenAI Responses API with model fallbacks. Replies are trimmed to MAX_CHAT_LEN and sent back via safeChat, keeping conversation history for context.

---

## 🚀 Getting Started

### 1. Install

```bash
git clone https://github.com/Florian-Celibashi/BuddyBot-2.git
cd BuddyBot-2
npm install
```
### 2. Configure
Create a .env next to package.json (or export env vars) with BOT_USERNAME, MC_HOST, MC_PORT, an OpenAI key, optional OPENAI_MODEL, 
and LOG_PATH if your logs aren’t in the default location (see src/config.js).

### 3. Run
Start your Minecraft Java server so it’s writing chat logs, then launch Buddybot:
```bash
npm start
```

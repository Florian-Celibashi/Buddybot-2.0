# BuddyBot 2.0 – GPT-Powered Minecraft Companion

## 🧭 Overview
- BuddyBot is a Mineflayer-driven Minecraft assistant that blends OpenAI reasoning with in-game automation.
- Helps players survive, craft, and explore by answering chat questions and executing follow/assist/friendly-fire commands.
- Built for quick local testing alongside the bundled `mc-server` harness or any vanilla server.

## ✨ Key Features
- **GPT guidance** – concise combat, crafting, and navigation tips powered by OpenAI with local fallbacks.
- **Command toggles** – `!follow`, `!assist`, `!friendlyfire`, and `!despawn` commands with role-play responses.
- **Combat intelligence** – contextual assist + auto-defense logic that resumes follow goals after a fight.
- **Memory-aware chat** – short-term memory layer to keep conversations on-topic without spamming chat.
- **Log watcher** – tail-based log ingestion so BuddyBot reacts instantly to player chat and events.
- **Modular skills** – drop-in command modules, triggers, and AI responders for future expansions.

## 🧰 Tech Stack
### Runtime & Environment
- Node.js 20+
- Minecraft Java server (bundled `server.jar` harness)

### Core Frameworks & Libraries
- [Mineflayer](https://github.com/PrismarineJS/mineflayer) for bot presence
- `mineflayer-pathfinder`, `mineflayer-pvp`, `minecraft-data` for navigation/combat
- `dotenv` for configuration management

### AI & Services
- OpenAI Chat Completions API (configurable model + fallbacks)
- Local log-watching of `latest.log` for real-time chat ingestion

## 🧩 Architecture Overview
- **`src/ai`** – OpenAI client, memory buffer, and responder logic enforcing short, server-safe replies.
- **`src/mc`** – Minecraft domain logic (bot spawn, follow/assist behaviors, inventory helpers, triggers, command router).
- **`src/infra`** – log tailer that feeds chat lines/events into the bot runtime.
- **`src/main.js`** – application bootstrap: loads config, wires Mineflayer, AI responder, and log watcher.
- **`mc-server/`** – lightweight vanilla server scaffolding for local dev/testing.

## ⚙️ Setup & Installation
```bash
# 1. Install dependencies
cd buddybot
npm install

# 2. Create environment file
touch .env  # fill using the variables listed in Configuration

# 3. Start a Minecraft server (local mc-server folder or your own host)
cd ../mc-server
java -Xmx2G -Xms2G -jar server.jar nogui

# 4. Run BuddyBot in a separate terminal
cd ../buddybot
npm start
```

## 🔐 Configuration
Create a `.env` file inside `buddybot/` with:
```
BOT_USERNAME=Buddybot
MC_HOST=localhost
MC_PORT=25565
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
LOG_PATH=/absolute/path/to/mc-server/logs/latest.log
```
Additional options:
- `OPENAI_5O_API_KEY` for experimental models.
- `USER_COOLDOWN_MS`, `MAX_CHAT_LEN`, `SPAWN_COOLDOWN_MS` overrides via `config.js` if needed.

## 🚀 Usage Examples
- **Follow player:** type `!follow` in chat to toggle trailing you at ~1 block distance.
- **Assist in combat:** `!assist` orders BuddyBot to defend you and resume following afterward.
- **Friendly fire control:** `!friendlyfire` toggles whether BuddyBot retaliates when struck.
- **Despawn bot:** `!despawn` cleanly disconnects BuddyBot from the server.
- **Ask questions:** plain chat (“Buddy, how craft shield?”) triggers GPT tips.

## 🗂️ Folder Structure
```
Buddybot-2/
├── README.md
├── buddybot/
│   ├── index.js              # Entrypoint forwarding to src/main.js
│   ├── package.json
│   └── src/
│       ├── ai/               # OpenAI client + memory + responder
│       ├── mc/               # Bot behaviors, commands, events, utilities
│       ├── infra/            # Log watcher + adapters
│       ├── config.js         # Centralized env + defaults
│       ├── logger.js
│       └── main.js           # Bootstrap + wiring
└── mc-server/                # Local vanilla server harness for testing
```

## 🔭 Future Improvements
- GUI dashboard for toggling behaviors and monitoring bot stats.
- Persistent knowledge base (vector store) for multi-session memory.
- Voice chat / speech-to-text integration for proximity chat servers.
- Automated resource gathering + crafting macros tied to GPT plans.

## 📜 License
Released under the ISC License. See `package.json` for details.

# Buddybot 2.0 — AI-Powered Minecraft Companion

https://drive.google.com/file/d/1ZRf-4N3e3UdTzyPqm3Y5LZsE132mHAMC/view?usp=sharing

## 🧭 Overview
Buddybot 2.0 is a mineflayer-based controller that lets you summon an AI-assisted Minecraft helper directly from server chat commands. It listens to `latest.log`, spawns a bot with context-aware behaviors, and answers player questions using OpenAI models.

## ✨ Key Features
- **Chat-triggered lifecycle**: Use in-game `!spawn` / `!despawn` commands to control the bot without leaving Minecraft.
- **OpenAI-backed conversations**: Lightweight responder with configurable system prompts, cooldowns, and message length guardrails.
- **Contextual behaviors**: Includes follow, assist, inventory, and trigger modules built on mineflayer pathfinder + PVP plugins.
- **Server-agnostic logging**: Polls any `latest.log` path, handling truncation and rotation gracefully.
- **Safe shutdown**: Ensures the bot despawns on process exit signals to avoid ghost connections.

## 🧰 Tech Stack
- **Environment**: Node.js 20+, npm
- **Frameworks & SDKs**:
  - [mineflayer](https://github.com/PrismarineJS/mineflayer) for Minecraft bot control
  - [mineflayer-pathfinder](https://github.com/PrismarineJS/mineflayer-pathfinder) for navigation
  - [mineflayer-pvp](https://github.com/PrismarineJS/mineflayer-pvp) for combat utilities
- **Libraries**:
  - `openai` for assistant responses
  - `dotenv` for configuration
  - `minecraft-data` for block/item lookup
- **Services**:
  - OpenAI API (GPT-5.1 with GPT-4o fallbacks)
  - Self-hosted Minecraft Java server (Vanilla, Fabric, or Paper)

## 🧩 Architecture Overview
- **Entry point (`src/main.js`)**: Boots log watcher, prints runtime config, and exposes a minimal CLI start.
- **Configuration & logging (`src/config.js`, `src/logger.js`)**: Centralizes env parsing, bot defaults, prompt tuning, and console helpers.
- **Infrastructure (`src/infra/logWatcher.js`)**: Polls the Minecraft log, detects player chat, and routes `!spawn/!despawn` to the bot controller.
- **Minecraft domain (`src/mc/`)**:
  - `bot.js`: Creates/despawns the mineflayer instance and wires plugins.
  - `chatHandler.js`, `commands/`, `triggers.js`: Parse chat, enforce cooldowns, and fire behaviors.
  - `assist.js`, `follow.js`, `inventory.js`, `utils.js`: Encapsulate pathfinding, combat, and item management routines.
- **AI helpers (`src/ai/`)**: OpenAI client wrapper, short-term memory buffer, and response formatter.

## ⚙️ Setup & Installation
```bash
# 1. Install Node dependencies
cd buddybot
npm install

# 2. Accept Minecraft EULA & prepare server (mc-server/eula.txt)
# 3. Copy .env template and update credentials
cp .env.example .env  # create this file based on the config below
```

## 🔐 Configuration
Create a `.env` file inside `buddybot/` (or export environment vars) with:

```bash
BOT_USERNAME=Buddybot
MC_HOST=localhost
MC_PORT=25565
LOG_PATH=/workspace/Buddybot-2.0/mc-server/logs/latest.log
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.1
```

Additional knobs (see `src/config.js`):
- `OPENAI_5O_API_KEY`: alternate key name used in some providers.
- `USER_COOLDOWN_MS`, `MAX_CHAT_LEN`, `SYSTEM_PROMPT`: chat throttling + prompt tuning.
- `SPAWN_COOLDOWN_MS`: guard against rapid spawn toggles.

## 🚀 Usage Examples
```bash
# Run Buddybot from the project root
cd buddybot
npm start
```
In-game chat commands:
- `!spawn` — start Buddybot on the server.
- `!despawn` — disconnect the bot safely.
Then simply chat with Buddybot; it will answer with OpenAI-generated replies.

## 🗂️ Folder Structure
```
Buddybot-2.0/
├── README.md
├── buddybot/
│   ├── index.js
│   ├── package.json
│   ├── src/
│   │   ├── main.js              # Entry point
│   │   ├── config.js            # Env + defaults
│   │   ├── logger.js
│   │   ├── infra/logWatcher.js  # Log polling + command routing
│   │   ├── ai/                  # OpenAI client + memory
│   │   └── mc/                  # Bot behaviors, commands, triggers
└── mc-server/                   # Local Minecraft server files
```

## 🔮 Future Improvements
- Web dashboard to monitor bot status, logs, and inventory.
- Persistent long-term memory backed by a vector store.
- Multi-bot orchestration for raids or automated builds.
- Integration tests against a headless server (e.g., via Prismarine replay).

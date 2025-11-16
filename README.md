# Ava AI Assistant (Buddybot-2)
_A context-aware Minecraft companion that brings OpenAI-powered insight directly into your server chat._

## 🌐 Live Demo
Self-hosted Minecraft instances only (no public deployment URL is bundled with this repository).

## 📝 Overview
Ava is implemented as the `Buddybot` Minecraft agent inside this repository. The service monitors a Java Edition server log, spins up a Mineflayer bot on demand, and streams Minecraft chat to OpenAI so players get concise, in-context answers without tabbing out of the game. Ava’s tight coupling with Mineflayer commands and automatic defensive behavior makes it ideal for server admins who want to provide always-on guidance to their community without building a separate UI.

### Who it helps
- **Server owners/admins** who need an always-available helper that can be spawned or despawned from chat.
- **Survival or SMP players** who want conversational tips (crafting, strategy, lore) without leaving the game.
- **Community moderators** who benefit from follow/assist toggles, friendly-fire notices, and automatic self-defense routines baked into the bot.

## ✨ Features
- **Conversation handling** – `src/mc/chatHandler.js` throttles per-user traffic, routes chat to the AI, and writes replies back to Minecraft through `safeChat`.
- **Context injection & memory** – `src/ai/memory.js` stores the last 20 turns per username, and `src/ai/responder.js` prepends the `SYSTEM_PROMPT` so every OpenAI call knows Buddybot’s persona.
- **Recruiter-tailored prompts?** – The current prompt is gamer-focused (friendly Minecraft helper) and can be swapped in `src/config.js` for any niche persona you need.
- **Command suite for companionship** – `!follow`, `!assist`, `!friendlyfire`, `!spawn`, and `!despawn` are parsed by `src/mc/commands/commands.js` to manage mobility, combat, and lifecycle.
- **Memory-aware friendly-fire banter** – When friendly fire toggles, `generateFriendlyFireLine` calls OpenAI (with fallback copy) for dramatic, player-specific announcements.
- **Defensive combat & assist mode** – `src/mc/assist.js` keeps track of the player being protected, intercepts `entityHurt`, triggers `mineflayer-pvp`, and resumes follow goals after combat.
- **Follow system** – `src/mc/follow.js` builds pathfinder goals so the bot dynamically trails a player, intelligently dropping the goal when toggled off.
- **Model routing & fallbacks** – `src/ai/client.js` rotates through `OPENAI_MODEL` plus `OPENAI_FALLBACKS` so downtime on one model will cascade to the next.
- **Error handling & chat safety** – `src/logger.js` centralizes logging, and `safeChat` wraps `bot.chat()` to avoid crashes when Minecraft disconnects.
- **Passive controller** – `src/infra/logWatcher.js` tails `latest.log` for `!spawn` / `!despawn` so operators can keep the Node process running even when the bot is offline.
- **Smart cooldowns** – `USER_COOLDOWN_MS` prevents spam by keeping per-player timestamps in `chatHandler`.
- **Configuration-driven behavior** – `src/config.js` wires environment variables for credentials, host, port, and log paths so you can run Ava beside any Java server.
- **mc-server bootstrap** – The `mc-server/` folder contains example server assets/log locations used when testing the watcher locally.

## 🏗 Architecture Overview
### High-level
1. `src/infra/logWatcher.js` tails the Minecraft server log and issues spawn/despawn commands.
2. `src/mc/bot.js` creates the Mineflayer bot, wires plugins (pathfinder, PvP), and registers chat/entity hooks.
3. `src/mc/chatHandler.js` detects commands or AI-triggering mentions, applies cooldown logic, and hands the conversation to the AI stack.
4. `src/ai/responder.js` builds the prompt stack (`SYSTEM_PROMPT` + memory + latest message) and calls the OpenAI Responses API via the `openai` SDK.
5. Replies flow back through `safeChat`, keeping output Minecraft-friendly.

### Frontend architecture
Ava has no traditional web frontend. The “UI” is Minecraft chat itself: players ping `@Buddybot` (or `@bb`) to trigger AI responses, and commands are typed directly in-game.

### Backend architecture
The backend is a single Node.js service. Core modules include:
- **Infrastructure** – `src/main.js` bootstraps logging, `src/infra/logWatcher.js` drives lifecycle.
- **Minecraft layer** – `src/mc/bot.js`, `src/mc/assist.js`, `src/mc/follow.js`, `src/mc/commands/commands.js`, `src/mc/triggers.js`, and `src/mc/utils.js` handle pathfinding, PvP hooks, friendly fire toggles, and chat parsing.
- **AI layer** – `src/ai/client.js`, `src/ai/memory.js`, and `src/ai/responder.js` manage OpenAI connectivity, per-user transcripts, and prompt crafting.

### Request/response flow
Minecraft chat → Mineflayer `chat` event → `chatHandler` → (command handled OR) `generateAIReply` → OpenAI Responses API → truncated text returned → `safeChat` emits reply back into Minecraft.

### OpenAI prompt pipeline
`generateAIReply` builds an array of `{ role, content }` messages consisting of:
1. `SYSTEM_PROMPT` from `src/config.js` defining Buddybot’s personality.
2. The last ~20 dialogue turns pulled from `memory.js` to keep context compact.
3. The latest user message prefixed with the player’s username.
If the primary model errors, `getModelCandidates()` rotates through fallback models.

### Deployment topology
- Run the Java Edition server (see `mc-server/`).
- Run `npm start` inside `buddybot/` on the same machine (or any machine that can reach the Minecraft host and read its logs via a mounted path).
- Operators interact entirely through Minecraft commands; no external dashboard is required, so cloud platforms like Vercel/Render are unnecessary.

## 🗂 Code Structure
```
Buddybot-2/
├── README.md                     # Project documentation (this file)
├── buddybot/
│   ├── index.js                  # Entry point that boots the passive controller.
│   ├── package.json              # Node.js dependencies and scripts.
│   └── src/
│       ├── main.js               # Starts the log watcher and prints runtime info.
│       ├── config.js             # Centralized environment-variable driven settings.
│       ├── logger.js             # Simple logging helpers for consistent prefixes.
│       ├── infra/
│       │   └── logWatcher.js     # Polls Minecraft logs to trigger spawn/despawn.
│       ├── ai/
│       │   ├── client.js         # Initializes the OpenAI SDK and model fallback list.
│       │   ├── memory.js         # Lightweight per-user conversation store.
│       │   └── responder.js      # Builds prompts and calls OpenAI responses API.
│       └── mc/
│           ├── bot.js            # Creates the Mineflayer bot and wires event handlers.
│           ├── chatHandler.js    # Filters chat, enforces cooldowns, invokes commands/AI.
│           ├── assist.js         # Assist/friendly-fire logic and PvP callbacks.
│           ├── follow.js         # Pathfinding follow goal management.
│           ├── triggers.js       # Rules for deciding when to answer a chat message.
│           ├── utils.js          # Safe chat helpers.
│           ├── events.js         # Placeholder for future event wiring.
│           ├── inventory.js      # Placeholder for inventory management routines.
│           └── commands/
│               └── commands.js   # Parses !follow/!assist/!friendlyfire/!despawn commands.
├── mc-server/                    # Sample Minecraft server assets/log locations for local dev.
└── .gitignore, package lock, etc.
```

## 🛠 Tech Stack
- **Runtime**: Node.js 18+
- **Minecraft automation**: `mineflayer`, `mineflayer-pathfinder`, `mineflayer-pvp`, `minecraft-data`
- **AI**: `openai` SDK hitting the Responses API (`OPENAI_MODEL` default `gpt-5.1`) plus REST call to `gpt-4.1-mini` for friendly-fire copy
- **Utilities**: `dotenv` for env management, native `fs` for log tailing
- **Hosting**: Designed to run on the same machine (or VPN-connected host) as your Minecraft Java Edition server; no Vercel/Render config is present.

## 🚀 Getting Started
### Prerequisites
- Node.js ≥ 18 and npm
- Access to a Minecraft Java Edition server whose logs you can read (the repo ships with `mc-server/` assets for local testing)
- An OpenAI API key with access to the configured models

### Backend / Bot service
```bash
cd buddybot
npm install
npm start
```
This launches the passive controller that tails `LOG_PATH` and waits for `!spawn` to be issued in Minecraft chat.

### Minecraft server
Point `LOG_PATH` (default `../mc-server/logs/latest.log`) at the log file produced by your server so the watcher can see `!spawn`/`!despawn` commands. The bot itself connects using `MC_HOST`/`MC_PORT` just like any Minecraft client.

### Connecting components locally
1. Start or reuse a Java server.
2. Run the bot process via `npm start` and confirm it can read the server logs.
3. From in-game chat, run `!spawn` to boot Ava/Buddybot; mention `@Buddybot` to converse.
4. Use `!despawn` when you want the Node process to drop the connection but keep watching logs.

## 🔑 Environment Variables
| Variable | Description |
| --- | --- |
| `BOT_USERNAME` | Minecraft username the bot should authenticate with (default `Buddybot`). |
| `MC_HOST` | Hostname/IP of the Minecraft server. |
| `MC_PORT` | Port number of the Minecraft server (default `25565`). |
| `OPENAI_5O_API_KEY` / `OPENAI_API_KEY` | Primary API key(s) used by `src/ai/client.js`. The `_5O` variant takes precedence if both are defined. |
| `OPENAI_MODEL` | Preferred Responses API model (defaults to `gpt-5.1`). |
| `OPENAI_API_TOKEN` | Optional alternate key specifically consumed by the friendly-fire prompt generator. |
| `LOG_PATH` | Absolute/relative path to the Minecraft `latest.log` file used by `logWatcher`. |

## 💬 Example Prompts
- `@Buddybot What’s the safest way to fight a Ravager without diamond armor?`
- `@bb Remind me how to craft an observer again?`
- `@Buddybot What do I need to trade with villagers for enchanted books?`
- `@bb How do I brew a potion of slow falling?`

## 📦 Future Enhancements
- **Finish event/inventory scaffolding** – `src/mc/events.js` and `src/mc/inventory.js` are empty placeholders, signaling room for richer automation (auto-looting, inventory management, event relays).
- **Web dashboard (optional)** – No frontend exists today; adding a panel for monitoring bot state or issuing commands remotely would complement the log-watcher approach.
- **Persistent memory** – `src/ai/memory.js` is in-memory only. Persisting transcripts per player would let Ava retain knowledge across restarts.
- **Advanced model routing** – Today’s fallback list is static; wiring real health checks or usage caps could reduce token costs and improve resilience.

## 📄 License
This project is distributed under the ISC License (see `buddybot/package.json`).

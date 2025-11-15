# BuddyBot 🐺🤖  
_A GPT-powered companion for your Minecraft server_

Buddybot is an AI-driven Minecraft companion that uses OpenAI’s latest models to answer your in-game questions and fight by your side.

- Game AI
- LLM-driven behavior
- Node.js + Mineflayer + OpenAI API integration

---

## ✨ Features

- **Self-Defense** - Buddybot automatically retaliates against any entity that attacks him.
- **Follow mode** – `!follow`  
  BuddyBot locks onto a player and follows them around, pathfinding around blocks and obstacles.
  When !follow mode is enabled, Buddybot intelligently breaks or places blocks as needed to navigate the terrain and reach the player.

- **Assist mode** – `!assist`  
  BuddyBot helps in combat: it will target threats near the assisted player (mobs, etc.) when this is enabled.

- **Friendly fire toggle** – `!friendlyfire`  
  Switch between:
  - _“Ignore friendly damage”_ (shrugs off accidental hits / playful punches)
  - _“Duel mode”_ (BuddyBot will treat you as a valid combat target)

- **Spawn / lifecycle commands** – `!spawn`, `!despawn` (or similar)  
  Start/quit the bot cleanly from Minecraft chat (exact commands can be tweaked in `commands.js`).

- **LLM-powered chat** – Talk to BuddyBot in Minecraft chat  
  Messages can be piped to OpenAI’s API so BuddyBot can role-play, explain mechanics, or just hang out.

- **Modular command system**  
  Commands like follow/assist/friendlyfire are split into their own modules, making it easy to add new ones.

---

## 🧱 Tech Stack

- **Language:** Node.js (JavaScript)
- **Game integration:** [mineflayer](https://github.com/PrismarineJS/mineflayer)
- **AI / LLM:** OpenAI API (e.g. `gpt-4.1`, `gpt-4.1-mini`, etc.)
- **Runtime:** Minecraft **Java Edition** server

The code is structured roughly like this:

- `src/mc/bot.js` – creates and configures the Mineflayer bot
- `src/mc/commands/commands.js` – parses chat messages like `!follow`, `!assist`, etc.
- `src/mc/commands/follow.js` – follow logic (`startFollow`, `stopFollow`, …)
- `src/mc/commands/assist.js` – combat assist logic
- `src/mc/commands/friendlyFire.js` – toggling damage behavior
- `src/llm/` – OpenAI client and prompt logic (model, system prompt, etc.)

_(File names may differ slightly depending on the current refactor, but this is the general layout.)_

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- A **Minecraft Java Edition server** you can connect to
- An **OpenAI API key**

### 2. Clone the repo

```bash
git clone https://github.com/<your-username>/BuddyBot-2.git
cd BuddyBot-2

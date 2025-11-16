# BuddyBot 🐺🤖  
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

- **Technologies:** Node.js, JavaScript, Mineflayer
- **AI / LLM:** OpenAI API (`gpt-5.1`)
- **Runtime:** Minecraft 1.16.5 **Java Edition** server

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

### 1. Dependencies

- **Node.js** ≥ 18
- **npm** or **yarn**
- A **Minecraft Java Edition server** you can connect to
- An **OpenAI API key**

### 2. Clone the repo

```bash
git clone https://github.com/Florian-Celibashi/BuddyBot-2.git
cd BuddyBot-2

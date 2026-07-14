# Local Minecraft server

This directory intentionally excludes the Minecraft server binary, worlds, logs, player data, EULA acceptance, and runtime configuration.

To create a local development server:

1. Download the server binary from the official Minecraft server download page and save it locally as `server.jar`.
2. Copy `server.properties.example` to `server.properties` and adjust the local settings.
3. Run the server once, review the Minecraft EULA, and set `eula=true` in the generated local `eula.txt` only if you accept it.
4. Point `LOG_PATH` in `buddybot/.env` to the generated `logs/latest.log` file.

All generated server files are ignored by Git.

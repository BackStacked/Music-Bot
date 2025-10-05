# Music Bot - Slash Commands Migration

This document explains the migration from prefix commands to Discord slash commands.

## Changes Made

### 1. Command Structure

- All commands have been converted from prefix-based (e.g., `!play song`) to Discord slash commands (e.g., `/play song`)
- Updated base `Command` class to use `ChatInputCommandInteraction` instead of `Message`
- Added proper slash command data definitions with options and descriptions

### 2. Updated Commands

#### Music Commands:

- `/play <query>` - Play a song or playlist (required string parameter)
- `/pause` - Pause or resume the current track
- `/skip` - Skip the current track
- `/stop` - Stop playback and disconnect from voice channel
- `/queue` - Show the current music queue
- `/volume [level]` - Set or show volume (optional integer 0-100)
- `/loop [mode]` - Set loop mode (optional choice: off/track/queue)
- `/filter [type] [level]` - Apply audio filters (optional choices with bassboost level)
- `/controller` - Show the music player controller

#### General Commands:

- `/help` - Show all available commands

### 3. Technical Changes

#### Bot Class (`src/core/Bot.ts`):

- Added slash command registration on startup
- Implemented interaction handling
- Updated command storage to use Discord.js Collection
- Added automatic command registration to Discord API

#### Command Base Class (`src/core/Command.ts`):

- Changed from `Message` to `ChatInputCommandInteraction`
- Added `data` property for slash command definitions
- Removed `aliases` as slash commands don't use aliases

#### Individual Commands:

- All commands updated to use `interaction.reply()` instead of `message.reply()`
- Added proper option handling using `interaction.options.getString()`, etc.
- Updated validation logic for guild members and voice channels

### 4. Environment Variables

Make sure to add the following to your `.env` file:

```env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_application_client_id_here
```

The `CLIENT_ID` is your Discord application's ID, which is required for registering slash commands.

### 5. Migration Benefits

1. **Better UX**: Native Discord slash command experience with autocomplete
2. **Type Safety**: Built-in parameter validation and type checking
3. **Discoverability**: Users can see available commands and their options
4. **Permissions**: Better integration with Discord's permission system
5. **Consistency**: Follows modern Discord bot development practices

### 6. Backward Compatibility

- Old prefix commands (`!play`, `!skip`, etc.) are no longer supported
- The bot will automatically register slash commands on startup
- Commands are available globally (not per-guild) for better user experience

### 7. Usage Examples

Before (prefix commands):

```
!play never gonna give you up
!volume 50
!loop track
!filter bassboost 3
```

After (slash commands):

```
/play query:never gonna give you up
/volume level:50
/loop mode:track
/filter type:bassboost level:3
```

The slash commands provide better autocomplete, validation, and user experience compared to the old prefix system.

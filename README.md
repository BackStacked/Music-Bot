# 🎵 Discord Music Bot

A feature-rich Discord music bot built with TypeScript and Discord.js v14, offering high-quality music streaming with an intuitive command system and modern UI controls.

## ✨ Features

- 🎶 **High-Quality Music Streaming** - Powered by Lavalink
- 🎛️ **Interactive Music Controls** - Skip, pause, resume, and volume controls
- 📝 **Queue Management** - View and manage your music queue
- 🔄 **Loop Modes** - Track and queue loop options
- 🎚️ **Audio Filters** - Enhance your listening experience
- 🎯 **Slash Commands Support** - Modern Discord command interface
- 🎨 **Rich Embeds** - Beautiful and informative message displays
- 📱 **Responsive UI** - Interactive buttons and components

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.9.0 or higher)
- [Discord Application](https://discord.com/developers/applications) with bot token
- [Lavalink Server](https://github.com/freyacodes/Lavalink) (for music streaming)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/BackStacked/Music-Bot.git
   cd Music-Bot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   DISCORD_TOKEN=your_bot_token_here
   LAVALINK_HOST=localhost
   LAVALINK_PORT=2333
   LAVALINK_PASSWORD=youshallnotpass
   ```

4. **Build the project**

   ```bash
   npm run build
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

### Development Mode

For development with auto-restart:

```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── index.ts                 # Bot entry point
├── commands/                # Command implementations
│   ├── HelpCommand.ts      # Help command
│   └── Music/              # Music-related commands
│       ├── FilterCommand.ts
│       ├── LoopCommand.ts
│       ├── PauseCommand.ts
│       ├── PlayCommand.ts
│       ├── PlayerController.ts
│       ├── QueueCommand.ts
│       ├── SkipCommand.ts
│       ├── StopCommand.ts
│       └── VolumeCommand.ts
├── config/                 # Configuration files
│   └── lavalink.ts        # Lavalink configuration
├── core/                  # Core bot functionality
│   ├── Bot.ts            # Main bot class
│   ├── Command.ts        # Base command class
│   ├── Embed.ts          # Custom embed builder
│   └── MusicManager.ts   # Music management system
├── events/               # Discord event handlers
│   ├── MessageCreate.ts  # Message handling
│   └── Ready.ts         # Bot ready event
├── UI/                  # User interface components
│   └── MusicController.ts # Music control interface
└── utils/               # Utility functions
    ├── EmbedFactory.ts  # Embed creation utilities
    └── Formatter.ts     # Text formatting utilities
```

## 🎵 Commands

### Music Commands

- `!play <song>` - Play a song or add to queue
- `!pause` - Pause the current track
- `!skip` - Skip to the next track
- `!stop` - Stop playback and clear queue
- `!queue` - Display the current queue
- `!volume <1-100>` - Adjust playback volume
- `!loop [off/track/queue]` - Set loop mode
- `!filter <filter>` - Apply audio filters

### General Commands

- `!help` - Display available commands

## ⚙️ Configuration

### Lavalink Setup

1. Download Lavalink from the [official repository](https://github.com/freyacodes/Lavalink)
2. Configure your `application.yml` file
3. Start the Lavalink server before running the bot

### Bot Permissions

Ensure your bot has the following permissions:

- Send Messages
- Use Slash Commands
- Connect to Voice Channels
- Speak in Voice Channels
- Use Voice Activity

## 🛠️ Built With

- **[Discord.js](https://discord.js.org/)** v14.21.0 - Discord API wrapper
- **[Blue.ts](https://www.npmjs.com/package/blue.ts)** - Command framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Lavalink](https://github.com/freyacodes/Lavalink)** - Audio streaming

## 📦 Dependencies

### Production

- `discord.js` - Discord API library
- `blue.ts` - Discord bot framework
- `dotenv` - Environment variable management
- `module-alias` - Module path aliasing

### Development

- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution
- `nodemon` - Development auto-restart
- `tsc-alias` - TypeScript path aliasing
- `tsconfig-paths` - TypeScript path resolution

## 🚀 Deployment

### Local Deployment

1. Follow the installation steps above
2. Configure your `.env` file
3. Run `npm run build && npm start`

### Production Deployment

1. Set up a VPS or cloud service
2. Install Node.js and PM2
3. Clone and configure the bot
4. Use PM2 for process management:
   ```bash
   pm2 start dist/index.js --name "music-bot"
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or need help:

1. Check the [Issues](https://github.com/BackStacked/Music-Bot/issues) page
2. Create a new issue with detailed information
3. Join our Discord server for community support

## 📈 Roadmap

- [✔️] Spotify playlist support
- [ ] Web dashboard
- [ ] Custom playlists
- [ ] Music recommendations
- [ ] Multi-language support

## 🙏 Acknowledgments

- Discord.js community for excellent documentation
- Lavalink developers for the audio streaming solution
- Contributors who helped improve this project

---

⭐ **Star this repository if you found it helpful!**

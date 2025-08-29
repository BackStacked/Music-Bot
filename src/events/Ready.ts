// events/Ready.ts
import { Client, ActivityType } from "discord.js";

export default (client: Client) => {
  console.log(`✅ Logged in as ${client.user?.tag}`);

  // Set the bot's activity
  client.user?.setActivity("with TypeScript", {
    type: ActivityType.Playing, // Playing, Listening, Watching, Competing
  });

  // Optional: set status
  client.user?.setStatus("dnd"); // online, idle, dnd, invisible

  console.log(`🎮 Bot presence set!`);
};

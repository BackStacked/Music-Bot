// src/core/MusicManager.ts
import { Client } from "discord.js";
import { Blue, Library } from "blue.ts";
import { nodes } from "../config/lavalink";

export class MusicManager {
  public manager: Blue;

  constructor(private readonly client: Client) {
    const options = {
      spotify: {
        client_id: process.env.SPOTIFY_CLIENT_ID || "",
        client_secret: process.env.SPOTIFY_CLIENT_SECRET || "",
      },
      autoplay: true,
      autoResume: false,
      version: "v4" as const,
      library: Library.DiscordJs,
    };

    this.manager = new Blue(nodes, options);

    this.client.once("ready", () => {
      this.manager.init(this.client as any);
      console.log("🎵 Music manager initialized!");
    });
  }
}

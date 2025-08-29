export const nodes = [
  {
    host: process.env.LAVALINK_HOST!,
    port: Number(process.env.LAVALINK_PORT!),
    password: process.env.LAVALINK_PASSWORD!,
    secure: process.env.LAVALINK_SECURE === "true",
  },
];

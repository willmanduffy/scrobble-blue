import { Env } from "../types";
import { BlueSky } from "../api-wrappers/bluesky";
import { LastFM } from "../api-wrappers/lastfm";

export const sync = async (env: Env) => {
  const lastfm = new LastFM(env);
  const latestSong = await lastfm.getLatestSong();

  if (latestSong) {
    try {
      const bluesky = await BlueSky.createAgent(env);
      const profile = await bluesky.getProfile();

      const existingDescription = getBaseDescription(profile?.description || "");

      const newDescription = `${existingDescription}\n\n🎵 Now Playing: "${latestSong.name}" by ${latestSong.artist['#text']}`;

      await bluesky.updateDescription(newDescription);
    } catch (error) {
      console.error("Failed to post to BlueSky:", error);
    }
  } else {
    console.log("No recent tracks found");
  }
};

const getBaseDescription = (description: string): string => {
  const nowPlayingIndex = description.indexOf('🎵 Now Playing:');

  if (nowPlayingIndex === -1) {
    return description.trim();
  }

  return description.substring(0, nowPlayingIndex).trim();
};

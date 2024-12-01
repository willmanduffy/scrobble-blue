import { Env } from "../types";
import { BlueSky } from "../api-wrappers/bluesky";
import { LatestTrackFetcher } from "./latest-track-fetcher";

export const sync = async (env: Env) => {
  const latestTrackFetcher = new LatestTrackFetcher(env);
  const latestTrack = await latestTrackFetcher.fetchLatestTrack();

  if (latestTrack) {
    try {
      const bluesky = await BlueSky.retrieveAgent(env);
      const profile = await bluesky.getProfile();

      const existingDescription = getBaseDescription(
        profile?.description || "",
      );

      const newDescription = `${existingDescription}\n\n🎵 Now Playing: "${latestTrack.name}" by ${latestTrack.artist}`;

      await bluesky.updateDescription(newDescription);
    } catch (error) {
      console.error("Failed to post to BlueSky:", error);
    }
  } else {
    console.log("No recent tracks found");
  }
};

const getBaseDescription = (description: string): string => {
  const nowPlayingIndex = description.indexOf("🎵 Now Playing:");

  if (nowPlayingIndex === -1) {
    return description.trim();
  }

  return description.substring(0, nowPlayingIndex).trim();
};

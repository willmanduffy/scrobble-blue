import { Env } from "../types";
import { BlueSky } from "../api-wrappers/bluesky";
import { LatestTrackFetcher } from "./latest-track-fetcher";
import { ProfileDescriptionGenerator } from "./profile-description-generator";

export const sync = async (env: Env) => {
  const latestTrackFetcher = new LatestTrackFetcher(env);

  const latestTrack = await latestTrackFetcher.call();

  if (latestTrack) {
    try {
      const bluesky = await BlueSky.retrieveAgent(env);
      const profile = await bluesky.getProfile();

      const newDescription = new ProfileDescriptionGenerator(
        profile,
        latestTrack,
      ).call();

      await bluesky.updateDescription(newDescription);
    } catch (error) {
      console.error("Failed to update profile on BlueSky:", error);
    }
  } else {
    console.log("No recent tracks found");
  }
};

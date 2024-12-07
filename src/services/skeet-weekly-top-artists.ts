import { Env } from "../types/env";
import { LastFM } from "../api-wrappers/lastfm";
import { WeeklyTopArtistsImageGenerator } from "./weekly-top-artists-image-generator";
import { BlueSky } from "../api-wrappers/bluesky";

export const skeetWeeklyTopArtists = async (env: Env) => {
  const lastfm = new LastFM(env);
  const bluesky = await BlueSky.retrieveAgent(env);

  const topArtists = await lastfm.getWeeklyTopArtists(5);

  const imageGenerator = new WeeklyTopArtistsImageGenerator(topArtists);
  const imageResponse = await imageGenerator.generate();

  if (!imageResponse) {
    return;
  }

  const embedImage = await imageResponse.blob();
  const altText = await imageGenerator.altText();

  await bluesky.postMessage(
    "Here are my top artists I listened to this last week! 🎸",
    {
      embedImage,
      altText,
      aspectRatio: {
        width: WeeklyTopArtistsImageGenerator.width,
        height: WeeklyTopArtistsImageGenerator.height,
      },
    },
  );
};

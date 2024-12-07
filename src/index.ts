import { skeetWeeklyTopArtists } from "./services/skeet-weekly-top-artists";
import { sync } from "./services/sync";
import { Env } from "./types/env";
import { LastFM } from "./api-wrappers/lastfm";
import { WeeklyTopArtistsImageGenerator } from "./services/weekly-top-artists-image-generator";

export default {
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    console.log("Scheduled event started at:", new Date().toISOString());

    switch (event.cron) {
      // Every minute
      case "* * * * *":
        // Sync the Bluesky profile with the latest track
        await sync(env);
        break;

      // Every Monday at 10am EST
      case "0 10 * * 1":
        // Post weekly top artists with image to Bluesky
        await skeetWeeklyTopArtists(env);
        break;

      default:
        throw new Error(`Unknown cron schedule: ${event.cron}`);
    }
  },

  // Note that this endpoint is largely used for local development. It does not have any form of
  // caching mechanism, so if linked to directly it could be rate limited by Last.fm.
  async fetch(request: Request, env: Env): Promise<Response> {
    // Only allow GET requests
    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const lastfm = new LastFM(env);
      const topArtists = await lastfm.getWeeklyTopArtists(5);

      const imageResponse = await new WeeklyTopArtistsImageGenerator(
        topArtists,
      ).generate();

      if (!imageResponse) {
        return new Response("No data available", { status: 404 });
      }

      // Return the image response directly
      return imageResponse;
    } catch (error) {
      console.error("Error generating image:", error);
      return new Response("Internal server error", { status: 500 });
    }
  },
};

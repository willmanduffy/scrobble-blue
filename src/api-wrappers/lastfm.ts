import { LastFm } from "@imikailoby/lastfm-ts";
import { RecentTrack } from "./lastfm.types";
import { Env } from "../types";

export class LastFM {
  private client: LastFm;
  private username: string;

  constructor(env: Env) {
    this.client = new LastFm(env.LASTFM_API_KEY);
    this.username = env.LASTFM_USERNAME;
  }

  async getLatestSong(): Promise<RecentTrack | undefined> {
    try {
      const response = await this.client.user.getRecentTracks({
        user: this.username,
        limit: "1",
      });

      if (!response.recenttracks?.track?.length) {
        return;
      }

      return response.recenttracks.track[0];
    } catch (error) {
      console.error("Failed to fetch latest song:", error);
      return;
    }
  }
}

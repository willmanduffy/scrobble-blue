import { LastFm } from "@imikailoby/lastfm-ts";
import { RecentTrack } from "./lastfm.types";
import { Env } from "../types/env";
import { NormalizedTrack } from "../types/track";

export class LastFM {
  private client: LastFm;
  private username: string;

  constructor(env: Env) {
    if (!env.LASTFM_API_KEY || !env.LASTFM_USERNAME) {
      throw new Error("LASTFM_API_KEY and LASTFM_USERNAME must be set.");
    }

    this.client = new LastFm(env.LASTFM_API_KEY);
    this.username = env.LASTFM_USERNAME;
  }

  async getLatestSong(): Promise<NormalizedTrack | undefined> {
    try {
      const response = await this.client.user.getRecentTracks({
        user: this.username,
        limit: "1",
      });

      if (!response.recenttracks?.track?.length) {
        return;
      }

      return this.normalizeTrack(response.recenttracks.track[0]);
    } catch (error) {
      console.error("Failed to fetch latest song:", error);
      return;
    }
  }

  private normalizeTrack(
    track: RecentTrack | undefined,
  ): NormalizedTrack | undefined {
    if (!track) {
      return;
    }

    return {
      name: track.name,
      artist: track.artist["#text"],
    };
  }
}

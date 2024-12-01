import { LastFm } from "@imikailoby/lastfm-ts";
import { RecentTrack } from "./lastfm.types";
import { Env } from "../types";
import { NormalizedTrack } from "../types/track";

export class LastFM {
  private client: LastFm;
  private username: string;

  constructor(env: Env) {
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

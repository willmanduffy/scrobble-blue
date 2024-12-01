import { ListenBrainzClient } from "@kellnerd/listenbrainz";
import { Env } from "../types/env";
import { NormalizedTrack } from "../types/track";
import { InsertedListen } from "@kellnerd/listenbrainz/listen";

export class ListenBrainz {
  private client: ListenBrainzClient;
  private username: string;

  constructor(env: Env) {
    if (!env.LISTENBRAINZ_TOKEN || !env.LISTENBRAINZ_USERNAME) {
      throw new Error(
        "LISTENBRAINZ_TOKEN and LISTENBRAINZ_USERNAME must be set.",
      );
    }

    this.client = new ListenBrainzClient({ userToken: env.LISTENBRAINZ_TOKEN });
    this.username = env.LISTENBRAINZ_USERNAME;
  }

  async getLatestSong(): Promise<NormalizedTrack | undefined> {
    try {
      const response = await this.client.getListens(this.username, {
        count: 1,
      });

      if (!response.listens?.length) {
        return;
      }

      return this.normalizeTrack(response.listens[0]);
    } catch (error) {
      console.error("Failed to fetch latest song:", error);
      return;
    }
  }

  private normalizeTrack(
    listen: InsertedListen | undefined,
  ): NormalizedTrack | undefined {
    if (!listen?.track_metadata) {
      return;
    }

    return {
      name: listen.track_metadata.track_name,
      artist: listen.track_metadata.artist_name,
      timestamp: listen.listened_at,
    };
  }
}

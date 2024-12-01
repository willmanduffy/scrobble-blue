import { LastFM } from "../api-wrappers/lastfm";
import { ListenBrainz } from "../api-wrappers/listenbrainz";
import { NoEnabledServicesError } from "../errors";
import { Env } from "../types/env";
import { NormalizedTrack } from "../types/track";

export class LatestTrackFetcher {
  private lastfm?: LastFM;
  private listenbrainz?: ListenBrainz;

  constructor(private env: Env) {
    if (env.LASTFM_API_KEY) {
      this.lastfm = new LastFM(env);
    }

    if (env.LISTENBRAINZ_TOKEN) {
      this.listenbrainz = new ListenBrainz(env);
    }
  }

  async call(): Promise<NormalizedTrack | undefined> {
    if (!this.lastfm && !this.listenbrainz) {
      throw new NoEnabledServicesError();
    }

    let latestTrackChecks: Promise<NormalizedTrack | undefined>[] = [];

    if (this.lastfm) {
      latestTrackChecks.push(this.lastfm.getLatestSong());
    }

    if (this.listenbrainz) {
      latestTrackChecks.push(this.listenbrainz.getLatestSong());
    }

    const latestTracks = await Promise.all(latestTrackChecks);

    return latestTracks
      .filter(Boolean)
      .sort((a, b) => b!.timestamp - a!.timestamp)[0];
  }
}

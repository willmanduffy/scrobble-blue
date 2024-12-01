import { LastFM } from "../api-wrappers/lastfm";
import { Env } from "../types";
import { NormalizedTrack } from "../types/track";

type EnabledServices = "lastfm";

class NoEnabledServicesError extends Error {
  constructor() {
    super("You must enable at least one service to fetch the latest track.");
  }
}

export class LatestTrackFetcher {
  private env: Env;
  private lastfm: LastFM;

  constructor(env: Env) {
    this.env = env;
    this.lastfm = new LastFM(env);
  }

  async call(): Promise<NormalizedTrack | undefined> {
    const enabledServices = await this.getEnabledServices();

    if (enabledServices.length === 0) {
      throw new NoEnabledServicesError();
    }

    let latestTrackChecks: Promise<NormalizedTrack | undefined>[] = [];

    if (enabledServices.includes("lastfm")) {
      latestTrackChecks.push(this.lastfm.getLatestSong());
    }

    const latestTracks = await Promise.all(latestTrackChecks);

    // TODO: As we add more services, we'll need to sort by timestamp across multiple services.
    // For now, just the first one works for our current needs.
    return latestTracks[0];
  }

  private async getEnabledServices() {
    let enabledServices: EnabledServices[] = [];

    if (this.env.LASTFM_API_KEY) {
      enabledServices.push("lastfm");
    }

    return enabledServices;
  }
}

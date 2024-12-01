import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { NormalizedTrack } from "../types/track";

export class ProfileDescriptionGenerator {
  constructor(
    private profile: ProfileViewDetailed | undefined,
    private latestTrack: NormalizedTrack,
  ) {
    this.profile = profile;
    this.latestTrack = latestTrack;
  }

  call(): string {
    if (this.getBaseDescription().length === 0) {
      return this.getNowPlayingDescription();
    }

    return `${this.getBaseDescription()}\n\n${this.getNowPlayingDescription()}`;
  }

  private getBaseDescription(): string {
    let baseDescription = this.profile?.description ?? "";

    const nowPlayingIndex = baseDescription?.indexOf("🎵 Now Playing:");

    if (nowPlayingIndex === -1) {
      return baseDescription.trim();
    }

    return baseDescription?.substring(0, nowPlayingIndex).trim();
  }

  private getNowPlayingDescription(): string {
    return `🎵 Now Playing: "${this.latestTrack.name}" by ${this.latestTrack.artist}`;
  }
}

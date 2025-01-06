import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { NormalizedTrack } from "../types/track";
import { SettingsService } from "./settings";

export class ProfileDescriptionGenerator {
  private readonly defaultNowPlayingMarker = "🎵 Now Playing: ";
  private readonly nowPlayingMarker: string;

  private constructor(
    private profile: ProfileViewDetailed | undefined,
    private track: NormalizedTrack,
    nowPlayingMarker: string,
  ) {
    this.nowPlayingMarker = nowPlayingMarker;
  }

  static async create(
    profile: ProfileViewDetailed | undefined,
    track: NormalizedTrack,
  ): Promise<ProfileDescriptionGenerator> {
    const marker = await SettingsService.getValue(
      "bio-now-playing-text",
      "🎵 Now Playing: ",
    );
    return new ProfileDescriptionGenerator(profile, track, marker);
  }

  call(): string {
    // Normalize the existing description, handling undefined and normalizing line breaks
    const existingDescription = (this.profile?.description || "")
      .replace(/\r\n/g, "\n")
      .replace(/\n\n+/g, "\n\n"); // Collapse multiple blank lines

    // Find where any "Now Playing" section starts (either current or default marker)
    const currentMarkerIndex = existingDescription.indexOf(
      this.nowPlayingMarker,
    );

    const defaultMarkerIndex = existingDescription.indexOf(
      this.defaultNowPlayingMarker,
    );

    const nowPlayingIndex = Math.max(currentMarkerIndex, defaultMarkerIndex);

    // Get the base description, being careful with trimming
    let baseDescription =
      nowPlayingIndex >= 0
        ? existingDescription.substring(0, nowPlayingIndex)
        : existingDescription;

    // First trim completely
    baseDescription = baseDescription.trim();

    // If there's content (not empty after trim), add double newline
    const separator = baseDescription ? "\n\n" : "";

    // Construct the new description
    const newDescription = `${baseDescription}${separator}${this.nowPlayingMarker}"${this.track.name}" by ${this.track.artist}`;

    // Add some logging to help debug issues
    console.info({
      original: this.profile?.description,
      normalized: existingDescription,
      baseDescription,
      final: newDescription,
    });

    return newDescription;
  }
}

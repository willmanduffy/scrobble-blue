import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { NormalizedTrack } from "../types/track";

export class ProfileDescriptionGenerator {
  private readonly NOW_PLAYING_MARKER = "🎵 Now Playing:";

  constructor(
    private profile: ProfileViewDetailed | undefined,
    private track: NormalizedTrack,
  ) {}

  call(): string {
    // Normalize the existing description, handling undefined and normalizing line breaks
    const existingDescription = (this.profile?.description || "")
      .replace(/\r\n/g, "\n")
      .replace(/\n\n+/g, "\n\n"); // Collapse multiple blank lines

    // Find where the current "Now Playing" section starts
    const nowPlayingIndex = existingDescription.indexOf(
      this.NOW_PLAYING_MARKER,
    );

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
    const newDescription = `${baseDescription}${separator}${this.NOW_PLAYING_MARKER} "${this.track.name}" by ${this.track.artist}`;

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

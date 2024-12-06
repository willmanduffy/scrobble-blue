import { Artist, LastFm } from "@imikailoby/lastfm-ts";
import { RecentTrack } from "./lastfm.types";
import { Env } from "../types/env";
import { NormalizedTrack } from "../types/track";
import { WeeklyTopArtist } from "../types/lastfm";
import { NormalizedWeeklyTopArtist } from "../types/weekly-top-artist";
import { NormalizedArtist } from "../types/artist";

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

  async getWeeklyTopArtists(limit = 3): Promise<NormalizedWeeklyTopArtist[]> {
    try {
      const response = await this.client.user.getWeeklyArtistChart({
        user: this.username,
      });

      const artists = response.weeklyartistchart?.artist.slice(0, limit);

      if (!artists?.length) {
        return [];
      }

      const artistsWithData = await Promise.all(
        artists.map(async (artist) => {
          const artistInfo = await this.getArtistInfo(artist.name);
          if (!artistInfo) return;
          return {
            ...artistInfo,
            playcount: artist.playcount,
          };
        }),
      ).then((results) =>
        results.filter(
          (r): r is NormalizedArtist & { playcount: string } => r !== undefined,
        ),
      );

      return artistsWithData.map(this.normalizeWeeklyTopArtist);
    } catch (error) {
      console.error("Failed to fetch top artists:", error);
      return [];
    }
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

  async getArtistInfo(
    artistName: string,
  ): Promise<NormalizedArtist | undefined> {
    try {
      const response = await this.client.artist.getInfo({
        artist: artistName,
        username: this.username,
        lang: "en",
      });

      if (!response.artist) {
        return;
      }

      return this.normalizeArtist(response.artist);
    } catch (error) {
      console.error(`Failed to fetch artist info for ${artistName}:`, error);
      return;
    }
  }

  private normalizeArtist = (artist: Artist): NormalizedArtist => ({
    name: artist.name,
    images: artist.image.map((image) => image["#text"]),
    url: artist.url,
  });

  private normalizeWeeklyTopArtist = (
    artist: NormalizedArtist & { playcount: string },
  ): NormalizedWeeklyTopArtist => ({
    name: artist.name,
    image: artist.images.filter((image) => image.match(/i\/u\/300x300/))[0],
    playcount: parseInt(artist.playcount),
  });

  private normalizeTrack(
    track: RecentTrack | undefined,
  ): NormalizedTrack | undefined {
    if (!track) {
      return;
    }

    return {
      name: track.name,
      artist: track.artist["#text"],
      timestamp: track.date?.uts ? parseInt(track.date.uts) : 0,
    };
  }
}

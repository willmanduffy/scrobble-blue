import { vi } from "vitest";

const mockGetRecentTracks = vi.fn();

vi.mock("@imikailoby/lastfm-ts", () => ({
  LastFm: vi.fn(() => ({
    user: {
      getRecentTracks: mockGetRecentTracks,
    },
  })),
}));

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { LastFM } from "./lastfm";
import { RecentTrack, RecentTracksResponse } from "./lastfm.types";
import { LastFm } from "@imikailoby/lastfm-ts";
import { mockEnv } from "../../tests/fixtures/env";

describe("LastFM", () => {
  let lastfm: LastFM;

  beforeEach(() => {
    vi.clearAllMocks();
    lastfm = new LastFM(mockEnv);
  });

  describe("getLatestSong", () => {
    it("should fetch latest song successfully", async () => {
      const mockTrack: RecentTrack = {
        artist: {
          "#text": "Test Artist",
          mbid: "test-mbid",
        },
        name: "Test Track",
        album: {
          "#text": "Test Album",
          mbid: "test-album-mbid",
        },
        url: "https://test.url",
        date: {
          uts: "1234567890",
          "#text": "01 Jan 2020 12:00",
        },
      };

      const mockResponse: RecentTracksResponse = {
        recenttracks: {
          track: [mockTrack],
        },
      };

      mockGetRecentTracks.mockResolvedValueOnce(mockResponse);

      const result = await lastfm.getLatestSong();

      expect(LastFm).toHaveBeenCalledWith(mockEnv.LASTFM_API_KEY);
      expect(mockGetRecentTracks).toHaveBeenCalledWith({
        user: mockEnv.LASTFM_USERNAME,
        limit: "1",
      });
      expect(result).toEqual(mockTrack);
    });

    it("should return undefined if no tracks are found", async () => {
      const mockResponse: RecentTracksResponse = {
        recenttracks: {
          track: [],
        },
      };

      mockGetRecentTracks.mockResolvedValueOnce(mockResponse);

      const result = await lastfm.getLatestSong();

      expect(result).toBeUndefined();
    });

    it("should return undefined if recenttracks is missing", async () => {
      const mockResponse = {} as RecentTracksResponse;

      mockGetRecentTracks.mockResolvedValueOnce(mockResponse);

      const result = await lastfm.getLatestSong();

      expect(result).toBeUndefined();
    });

    it("should return undefined and log error if API call fails", async () => {
      mockGetRecentTracks.mockRejectedValueOnce(new Error("API Error"));

      const result = await lastfm.getLatestSong();

      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        "Failed to fetch latest song:",
        expect.any(Error),
      );
    });

    it("should handle currently playing track", async () => {
      const mockTrack: RecentTrack = {
        artist: {
          "#text": "Test Artist",
          mbid: "test-mbid",
        },
        name: "Test Track",
        album: {
          "#text": "Test Album",
          mbid: "test-album-mbid",
        },
        url: "https://test.url",
        "@attr": {
          nowplaying: "true",
        },
      };

      const mockResponse: RecentTracksResponse = {
        recenttracks: {
          track: [mockTrack],
        },
      };

      mockGetRecentTracks.mockResolvedValueOnce(mockResponse);

      const result = await lastfm.getLatestSong();

      expect(result).toEqual(mockTrack);
    });
  });
});

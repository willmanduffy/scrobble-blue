import { vi } from "vitest";

const mockGetRecentTracks = vi.fn();
const mockGetWeeklyArtistChart = vi.fn();
const mockGetArtistInfo = vi.fn();

vi.mock("@imikailoby/lastfm-ts", () => ({
  LastFm: vi.fn(() => ({
    user: {
      getRecentTracks: mockGetRecentTracks,
      getWeeklyArtistChart: mockGetWeeklyArtistChart,
    },
    artist: {
      getInfo: mockGetArtistInfo,
    },
  })),
}));

import { describe, it, expect, beforeEach } from "vitest";
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
      expect(result).toEqual({
        name: "Test Track",
        artist: "Test Artist",
        timestamp: 1234567890,
      });
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

      expect(result).toEqual({
        name: "Test Track",
        artist: "Test Artist",
        timestamp: 0,
      });
    });
  });

  describe("getWeeklyTopArtists", () => {
    const lastfm = new LastFM(mockEnv);

    it("should fetch and normalize top artists", async () => {
      const mockTopArtists = [
        { name: "Artist 1", playcount: "10", mbid: "", url: "" },
        { name: "Artist 2", playcount: "8", mbid: "", url: "" },
        { name: "Artist 3", playcount: "5", mbid: "", url: "" },
      ];

      mockGetWeeklyArtistChart.mockResolvedValueOnce({
        weeklyartistchart: {
          "@attr": {
            from: "1234567890",
            to: "1234567890",
            user: mockEnv.LASTFM_USERNAME,
          },
          artist: mockTopArtists,
        },
      });

      mockGetArtistInfo
        .mockResolvedValueOnce({
          artist: {
            name: "Artist 1",
            url: "https://last.fm/artist/1",
            image: [{ "#text": "https://lastfm.com/i/u/300x300/artist1.jpg" }],
          },
        })
        .mockResolvedValueOnce({
          artist: {
            name: "Artist 2",
            url: "https://last.fm/artist/2",
            image: [{ "#text": "https://lastfm.com/i/u/300x300/artist2.jpg" }],
          },
        })
        .mockResolvedValueOnce({
          artist: {
            name: "Artist 3",
            url: "https://last.fm/artist/3",
            image: [{ "#text": "https://lastfm.com/i/u/300x300/artist3.jpg" }],
          },
        });

      const result = await lastfm.getWeeklyTopArtists();

      expect(mockGetWeeklyArtistChart).toHaveBeenCalledWith({
        user: mockEnv.LASTFM_USERNAME,
      });

      expect(result).toEqual([
        {
          name: "Artist 1",
          playcount: 10,
          image: "https://lastfm.com/i/u/300x300/artist1.jpg",
        },
        {
          name: "Artist 2",
          playcount: 8,
          image: "https://lastfm.com/i/u/300x300/artist2.jpg",
        },
        {
          name: "Artist 3",
          playcount: 5,
          image: "https://lastfm.com/i/u/300x300/artist3.jpg",
        },
      ]);
    });

    it("should return empty array when no artists found", async () => {
      mockGetWeeklyArtistChart.mockResolvedValueOnce({
        weeklyartistchart: {
          "@attr": {
            from: "1234567890",
            to: "1234567890",
            user: mockEnv.LASTFM_USERNAME,
          },
          artist: [],
        },
      });

      const result = await lastfm.getWeeklyTopArtists();

      expect(result).toEqual([]);
    });

    it("should return empty array when API call fails", async () => {
      mockGetWeeklyArtistChart.mockRejectedValueOnce(new Error("API Error"));

      const result = await lastfm.getWeeklyTopArtists();

      expect(result).toEqual([]);
    });
  });

  describe("getArtistInfo", () => {
    const lastfm = new LastFM(mockEnv);

    it("should fetch and normalize artist info", async () => {
      mockGetArtistInfo.mockResolvedValueOnce({
        artist: {
          name: "Test Artist",
          stats: { userplaycount: "42" },
          url: "https://last.fm/artist/test",
          tags: { tag: [{ name: "rock" }, { name: "indie" }] },
          bio: { summary: "Test bio" },
          image: [{ "#text": "image-url" }],
        },
      });

      const result = await lastfm.getArtistInfo("Test Artist");

      expect(mockGetArtistInfo).toHaveBeenCalledWith({
        artist: "Test Artist",
        username: mockEnv.LASTFM_USERNAME,
        lang: "en",
      });

      expect(result).toEqual({
        name: "Test Artist",
        images: ["image-url"],
        url: "https://last.fm/artist/test",
      });
    });
  });
});

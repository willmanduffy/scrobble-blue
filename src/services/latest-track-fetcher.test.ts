import { describe, it, expect, vi, beforeEach } from "vitest";
import { LatestTrackFetcher } from "./latest-track-fetcher";
import { mockEnv } from "../../tests/fixtures/env";
import { track } from "../../tests/fixtures/track";

const mockLastFMGetLatestSong = vi.fn();
const mockListenBrainzGetLatestSong = vi.fn();

vi.mock("../api-wrappers/lastfm", () => ({
  LastFM: vi.fn().mockImplementation(() => ({
    getLatestSong: mockLastFMGetLatestSong,
  })),
}));

vi.mock("../api-wrappers/listenbrainz", () => ({
  ListenBrainz: vi.fn().mockImplementation(() => ({
    getLatestSong: mockListenBrainzGetLatestSong,
  })),
}));

describe("LatestTrackFetcher", () => {
  let fetcher: LatestTrackFetcher;

  beforeEach(() => {
    vi.clearAllMocks();
    fetcher = new LatestTrackFetcher(mockEnv);
  });

  describe("call", () => {
    it("should fetch track from LastFM when only LastFM is enabled", async () => {
      const envWithOnlyLastFM = {
        ...mockEnv,
        LISTENBRAINZ_TOKEN: undefined,
      };
      fetcher = new LatestTrackFetcher(envWithOnlyLastFM);

      mockLastFMGetLatestSong.mockResolvedValueOnce(track);

      const result = await fetcher.call();

      expect(mockLastFMGetLatestSong).toHaveBeenCalled();
      expect(mockListenBrainzGetLatestSong).not.toHaveBeenCalled();
      expect(result).toEqual(track);
    });

    it("should fetch track from ListenBrainz when only ListenBrainz is enabled", async () => {
      const envWithOnlyListenBrainz = {
        ...mockEnv,
        LASTFM_API_KEY: undefined,
        LISTENBRAINZ_TOKEN: "token",
        LISTENBRAINZ_USERNAME: "username",
      };
      fetcher = new LatestTrackFetcher(envWithOnlyListenBrainz);

      mockListenBrainzGetLatestSong.mockResolvedValueOnce(track);

      const result = await fetcher.call();

      expect(mockLastFMGetLatestSong).not.toHaveBeenCalled();
      expect(mockListenBrainzGetLatestSong).toHaveBeenCalled();
      expect(result).toEqual(track);
    });

    it("should return most recent track when both services are enabled", async () => {
      const envWithBoth = {
        ...mockEnv,
        LISTENBRAINZ_TOKEN: "token",
        LISTENBRAINZ_USERNAME: "username",
      };
      fetcher = new LatestTrackFetcher(envWithBoth);

      const olderTrack = { ...track, timestamp: 1000 };
      const newerTrack = { ...track, timestamp: 2000 };

      mockLastFMGetLatestSong.mockResolvedValueOnce(olderTrack);
      mockListenBrainzGetLatestSong.mockResolvedValueOnce(newerTrack);

      const result = await fetcher.call();

      expect(mockLastFMGetLatestSong).toHaveBeenCalled();
      expect(mockListenBrainzGetLatestSong).toHaveBeenCalled();
      expect(result).toEqual(newerTrack);
    });

    it("should handle when one service returns undefined", async () => {
      const envWithBoth = {
        ...mockEnv,
        LISTENBRAINZ_TOKEN: "token",
        LISTENBRAINZ_USERNAME: "username",
      };
      fetcher = new LatestTrackFetcher(envWithBoth);

      mockLastFMGetLatestSong.mockResolvedValueOnce(undefined);
      mockListenBrainzGetLatestSong.mockResolvedValueOnce(track);

      const result = await fetcher.call();

      expect(result).toEqual(track);
    });

    it("should throw when no services are enabled", async () => {
      const envWithNoServices = {
        ...mockEnv,
        LASTFM_API_KEY: undefined,
      };

      fetcher = new LatestTrackFetcher(envWithNoServices);

      await expect(fetcher.call()).rejects.toThrow(
        "You must enable at least one service to fetch the latest track.",
      );

      expect(mockLastFMGetLatestSong).not.toHaveBeenCalled();
      expect(mockListenBrainzGetLatestSong).not.toHaveBeenCalled();
    });
  });
});

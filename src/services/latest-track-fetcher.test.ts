import { describe, it, expect, vi, beforeEach } from "vitest";
import { LatestTrackFetcher } from "./latest-track-fetcher";
import { mockEnv } from "../../tests/fixtures/env";
import { NormalizedTrack } from "../types/track";

const mockGetLatestSong = vi.fn();

vi.mock("../api-wrappers/lastfm", () => ({
  LastFM: vi.fn().mockImplementation(() => ({
    getLatestSong: mockGetLatestSong,
  })),
}));

describe("LatestTrackFetcher", () => {
  let fetcher: LatestTrackFetcher;

  beforeEach(() => {
    vi.clearAllMocks();
    fetcher = new LatestTrackFetcher(mockEnv);
  });

  describe("fetchLatestTrack", () => {
    it("should fetch track from LastFM when enabled", async () => {
      const mockTrack: NormalizedTrack = {
        artist: "Test Artist",
        name: "Test Song",
      };

      mockGetLatestSong.mockResolvedValueOnce(mockTrack);

      const result = await fetcher.call();

      expect(mockGetLatestSong).toHaveBeenCalled();
      expect(result).toEqual(mockTrack);
    });

    it("should return undefined when no track is found", async () => {
      mockGetLatestSong.mockResolvedValueOnce(undefined);

      const result = await fetcher.call();

      expect(mockGetLatestSong).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it("should throw when no services are enabled", async () => {
      const envWithoutLastFM = { ...mockEnv, LASTFM_API_KEY: undefined };

      fetcher = new LatestTrackFetcher(envWithoutLastFM);

      await expect(fetcher.call()).rejects.toThrow(
        "You must enable at least one service to fetch the latest track.",
      );

      expect(mockGetLatestSong).not.toHaveBeenCalled();
    });
  });
});

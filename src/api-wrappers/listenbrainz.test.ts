import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListenBrainz } from "./listenbrainz";
import { mockEnv } from "../../tests/fixtures/env";
import { mockListen } from "../../tests/fixtures/listenbrainz";

const mockGetListens = vi.fn();

vi.mock("@kellnerd/listenbrainz", () => ({
  ListenBrainzClient: vi.fn().mockImplementation(() => ({
    getListens: mockGetListens,
  })),
}));

describe("ListenBrainz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw if credentials are missing", () => {
    const envWithoutToken = { ...mockEnv, LISTENBRAINZ_TOKEN: undefined };
    expect(() => new ListenBrainz(envWithoutToken)).toThrow(
      "LISTENBRAINZ_TOKEN and LISTENBRAINZ_USERNAME must be set.",
    );

    const envWithoutUsername = { ...mockEnv, LISTENBRAINZ_USERNAME: undefined };
    expect(() => new ListenBrainz(envWithoutUsername)).toThrow(
      "LISTENBRAINZ_TOKEN and LISTENBRAINZ_USERNAME must be set.",
    );
  });

  describe("getLatestSong", () => {
    const listenbrainz = new ListenBrainz({
      ...mockEnv,
      LISTENBRAINZ_TOKEN: "test-token",
      LISTENBRAINZ_USERNAME: "test-user",
    });

    it("should fetch and normalize the latest track", async () => {
      mockGetListens.mockResolvedValueOnce({
        listens: [mockListen],
      });

      const result = await listenbrainz.getLatestSong();

      expect(mockGetListens).toHaveBeenCalledWith("test-user", {
        count: 1,
      });

      expect(result).toEqual({
        name: "Test Song",
        artist: "Test Artist",
        timestamp: 1234567890,
      });
    });

    it("should return undefined when no listens are found", async () => {
      mockGetListens.mockResolvedValueOnce({ listens: [] });

      const result = await listenbrainz.getLatestSong();

      expect(result).toBeUndefined();
    });

    it("should return undefined when the API call fails", async () => {
      mockGetListens.mockRejectedValueOnce(new Error("API Error"));

      const result = await listenbrainz.getLatestSong();

      expect(result).toBeUndefined();
    });

    it("should return undefined for malformed track data", async () => {
      const malformedListen = {
        listened_at: 1234567890,
        user_name: "test-user",
        recording_msid: "test-recording-id",
      };

      mockGetListens.mockResolvedValueOnce({
        listens: [malformedListen],
      });

      const result = await listenbrainz.getLatestSong();

      expect(result).toBeUndefined();
    });
  });
});

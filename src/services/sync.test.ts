import { vi, describe, it, expect, beforeEach } from "vitest";
import { sync } from "./sync";
import { LastFM } from "../api-wrappers/lastfm";
import { BlueSky } from "../api-wrappers/bluesky";

vi.mock("../api-wrappers/lastfm");
vi.mock("../api-wrappers/bluesky");

describe("sync", () => {
  const mockEnv = {
    LASTFM_API_KEY: "test-api-key",
    LASTFM_USERNAME: "test-user",
    BSKY_USERNAME: "test-bsky",
    BSKY_PASSWORD: "test-pass",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update BlueSky profile with latest song", async () => {
    const mockTrack = {
      name: "Test Track",
      artist: { "#text": "Test Artist", mbid: "" },
      album: { "#text": "Test Album", mbid: "" },
      url: "https://test.url"
    };

    const mockUpdateDescription = vi.fn();
    const mockGetProfile = vi.fn().mockResolvedValue({
      did: "test-did",
      description: "Test description",
    });

    vi.mocked(LastFM.prototype.getLatestSong).mockResolvedValue(mockTrack);
    vi.mocked(BlueSky.createAgent).mockResolvedValue({
      getProfile: mockGetProfile,
      updateDescription: mockUpdateDescription,
    } as unknown as BlueSky);

    await sync(mockEnv);

    expect(LastFM.prototype.getLatestSong).toHaveBeenCalled();
    expect(BlueSky.createAgent).toHaveBeenCalledWith(mockEnv);
    expect(mockUpdateDescription).toHaveBeenCalledWith(
      "Test description\n\n🎵 Now Playing: \"Test Track\" by Test Artist"
    );
  });

  it("should handle no recent tracks", async () => {
    vi.mocked(LastFM.prototype.getLatestSong).mockResolvedValue(undefined);

    await sync(mockEnv);

    expect(LastFM.prototype.getLatestSong).toHaveBeenCalled();
    expect(BlueSky.createAgent).not.toHaveBeenCalled();
  });

  it("should preserve existing description and replace Now Playing", async () => {
    const mockTrack = {
      name: "Test Track",
      artist: { "#text": "Test Artist", mbid: "" },
      album: { "#text": "Test Album", mbid: "" },
      url: "https://test.url"
    };

    const mockUpdateDescription = vi.fn();
    const mockGetProfile = vi.fn().mockResolvedValue({
      did: "test-did",
      description: "Test description\n🎵 Now Playing: \"Old Track\" by Old Artist",
    });

    vi.mocked(LastFM.prototype.getLatestSong).mockResolvedValue(mockTrack);
    vi.mocked(BlueSky.createAgent).mockResolvedValue({
      getProfile: mockGetProfile,
      updateDescription: mockUpdateDescription,
    } as unknown as BlueSky);

    await sync(mockEnv);

    expect(mockUpdateDescription).toHaveBeenCalledWith(
      "Test description\n\n🎵 Now Playing: \"Test Track\" by Test Artist"
    );
  });

  it("should handle BlueSky errors", async () => {
    const mockTrack = {
      name: "Test Track",
      artist: { "#text": "Test Artist", mbid: "" },
      album: { "#text": "Test Album", mbid: "" },
      url: "https://test.url"
    };

    vi.mocked(LastFM.prototype.getLatestSong).mockResolvedValue(mockTrack);
    vi.mocked(BlueSky.createAgent).mockRejectedValue(new Error("BlueSky error"));

    await sync(mockEnv);

    expect(LastFM.prototype.getLatestSong).toHaveBeenCalled();
    expect(BlueSky.createAgent).toHaveBeenCalled();
  });
}); 
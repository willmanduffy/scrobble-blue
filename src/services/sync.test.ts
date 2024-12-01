import { vi, describe, it, expect, beforeEach } from "vitest";
import { sync } from "./sync";
import { LastFM } from "../api-wrappers/lastfm";
import { BlueSky } from "../api-wrappers/bluesky";
import { mockEnv } from "../../tests/fixtures/env";

vi.mock("../api-wrappers/lastfm");
vi.mock("../api-wrappers/bluesky");

describe("sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update BlueSky profile with latest song", async () => {
    const mockTrack = {
      name: "Test Track",
      artist: "Test Artist",
    };

    const mockUpdateDescription = vi.fn();
    const mockGetProfile = vi.fn().mockResolvedValue({
      did: "test-did",
      description: "Test description",
    });

    vi.mocked(LastFM.prototype.getLatestSong).mockResolvedValue(mockTrack);
    vi.mocked(BlueSky.retrieveAgent).mockResolvedValue({
      getProfile: mockGetProfile,
      updateDescription: mockUpdateDescription,
    } as unknown as BlueSky);

    await sync(mockEnv);

    expect(LastFM.prototype.getLatestSong).toHaveBeenCalled();
    expect(BlueSky.retrieveAgent).toHaveBeenCalledWith(mockEnv);
    expect(mockUpdateDescription).toHaveBeenCalledWith(
      'Test description\n\n🎵 Now Playing: "Test Track" by Test Artist',
    );
  });

  it("should handle no recent tracks", async () => {
    vi.mocked(LastFM.prototype.getLatestSong).mockResolvedValue(undefined);

    await sync(mockEnv);

    expect(LastFM.prototype.getLatestSong).toHaveBeenCalled();
    expect(BlueSky.retrieveAgent).not.toHaveBeenCalled();
  });

  it("should preserve existing description and replace Now Playing", async () => {
    const mockTrack = {
      name: "Test Track",
      artist: "Test Artist",
    };

    const mockUpdateDescription = vi.fn();
    const mockGetProfile = vi.fn().mockResolvedValue({
      did: "test-did",
      description:
        'Test description\n🎵 Now Playing: "Old Track" by Old Artist',
    });

    vi.mocked(LastFM.prototype.getLatestSong).mockResolvedValue(mockTrack);
    vi.mocked(BlueSky.retrieveAgent).mockResolvedValue({
      getProfile: mockGetProfile,
      updateDescription: mockUpdateDescription,
    } as unknown as BlueSky);

    await sync(mockEnv);

    expect(mockUpdateDescription).toHaveBeenCalledWith(
      'Test description\n\n🎵 Now Playing: "Test Track" by Test Artist',
    );
  });

  it("should handle BlueSky errors", async () => {
    const mockTrack = {
      name: "Test Track",
      artist: "Test Artist",
    };

    vi.mocked(LastFM.prototype.getLatestSong).mockResolvedValue(mockTrack);
    vi.mocked(BlueSky.retrieveAgent).mockRejectedValue(
      new Error("BlueSky error"),
    );

    await sync(mockEnv);

    expect(LastFM.prototype.getLatestSong).toHaveBeenCalled();
    expect(BlueSky.retrieveAgent).toHaveBeenCalled();
  });
});

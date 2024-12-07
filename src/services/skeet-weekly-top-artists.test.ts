import { describe, it, expect, vi, beforeEach } from "vitest";
import { skeetWeeklyTopArtists } from "./skeet-weekly-top-artists";
import { LastFM } from "../api-wrappers/lastfm";
import { BlueSky } from "../api-wrappers/bluesky";
import { WeeklyTopArtistsImageGenerator } from "./weekly-top-artists-image-generator";
import { mockEnv } from "../../tests/fixtures/env";

// Mock dependencies
vi.mock("../api-wrappers/lastfm");
vi.mock("../api-wrappers/bluesky");
vi.mock("./weekly-top-artists-image-generator");
vi.mock("workers-og", () => ({
  ImageResponse: vi.fn().mockImplementation(() => new Response()),
}));

describe("skeetWeeklyTopArtists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully post weekly top artists to Bluesky", async () => {
    // Mock data
    const mockTopArtists = [
      { name: "Artist 1", playcount: 10, image: "url1" },
      { name: "Artist 2", playcount: 8, image: "url2" },
      { name: "Artist 3", playcount: 6, image: "url3" },
      { name: "Artist 4", playcount: 4, image: "url4" },
      { name: "Artist 5", playcount: 2, image: "url5" },
    ];

    // Mock LastFM
    vi.mocked(LastFM.prototype.getWeeklyTopArtists).mockResolvedValue(
      mockTopArtists,
    );

    // Mock BlueSky
    const mockBlueskyInstance = { postMessage: vi.fn() };
    vi.mocked(BlueSky.retrieveAgent).mockResolvedValue(
      mockBlueskyInstance as any,
    );

    // Mock image generator
    const mockImageResponse = new Response(new Blob(["mock-image"]));
    const mockAltText = "My weekly top artists on Last.fm";

    vi.mocked(
      WeeklyTopArtistsImageGenerator.prototype.generate,
    ).mockResolvedValue(mockImageResponse);
    vi.mocked(
      WeeklyTopArtistsImageGenerator.prototype.altText,
    ).mockResolvedValue(mockAltText);

    // Execute
    await skeetWeeklyTopArtists(mockEnv);

    // Verify
    expect(LastFM.prototype.getWeeklyTopArtists).toHaveBeenCalledWith(5);
    expect(BlueSky.retrieveAgent).toHaveBeenCalledWith(mockEnv);
    expect(
      WeeklyTopArtistsImageGenerator.prototype.generate,
    ).toHaveBeenCalled();
    expect(WeeklyTopArtistsImageGenerator.prototype.altText).toHaveBeenCalled();
    expect(mockBlueskyInstance.postMessage).toHaveBeenCalledWith(
      "Here are my top artists I listened to this last week! 🎸",
      {
        embedImage: expect.any(Blob),
        altText: mockAltText,
        aspectRatio: {
          width: WeeklyTopArtistsImageGenerator.width,
          height: WeeklyTopArtistsImageGenerator.height,
        },
      },
    );
  });

  it("should do nothing if image generation fails", async () => {
    // Mock data
    const mockTopArtists = [
      { name: "Artist 1", playcount: 10, image: "url1" },
      { name: "Artist 2", playcount: 8, image: "url2" },
    ];

    // Mock dependencies
    vi.mocked(LastFM.prototype.getWeeklyTopArtists).mockResolvedValue(
      mockTopArtists,
    );
    const mockBlueskyInstance = { postMessage: vi.fn() };
    vi.mocked(BlueSky.retrieveAgent).mockResolvedValue(
      mockBlueskyInstance as any,
    );
    vi.mocked(
      WeeklyTopArtistsImageGenerator.prototype.generate,
    ).mockResolvedValue(undefined);

    // Execute
    await skeetWeeklyTopArtists(mockEnv);

    // Verify
    expect(mockBlueskyInstance.postMessage).not.toHaveBeenCalled();
  });
});

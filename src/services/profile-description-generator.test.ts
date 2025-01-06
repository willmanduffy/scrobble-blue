import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProfileDescriptionGenerator } from "./profile-description-generator";
import { SettingsService } from "./settings";

vi.mock("./settings", () => ({
  SettingsService: {
    getValue: vi.fn(),
  },
}));

describe("ProfileDescriptionGenerator", () => {
  const mockTrack = {
    name: "Test Song",
    artist: "Test Artist",
    timestamp: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should use custom now playing text from settings", async () => {
    const customText = "🎧 Currently vibing to: ";
    vi.mocked(SettingsService.getValue).mockResolvedValue(customText);

    const generator = await ProfileDescriptionGenerator.create(
      undefined,
      mockTrack,
    );
    const result = generator.call();

    expect(result).toBe(`${customText}"Test Song" by Test Artist`);
    expect(SettingsService.getValue).toHaveBeenCalledWith(
      "bio-now-playing-text",
      "🎵 Now Playing: ",
    );
  });

  it("should use default now playing text when settings return default", async () => {
    const defaultText = "🎵 Now Playing: ";
    vi.mocked(SettingsService.getValue).mockResolvedValue(defaultText);

    const generator = await ProfileDescriptionGenerator.create(
      undefined,
      mockTrack,
    );
    const result = generator.call();

    expect(result).toBe(`${defaultText}"Test Song" by Test Artist`);
    expect(SettingsService.getValue).toHaveBeenCalledWith(
      "bio-now-playing-text",
      defaultText,
    );
  });

  it("should preserve existing bio content", async () => {
    const customText = "🎧 Currently vibing to: ";
    vi.mocked(SettingsService.getValue).mockResolvedValue(customText);

    const existingBio = "I love music!\nCheck out my playlists";
    const generator = await ProfileDescriptionGenerator.create(
      { description: existingBio } as any,
      mockTrack,
    );
    const result = generator.call();

    expect(result).toBe(
      `I love music!\nCheck out my playlists\n\n${customText}"Test Song" by Test Artist`,
    );
  });

  it("should replace existing now playing section", async () => {
    const customText = "🎧 Currently vibing to: ";
    vi.mocked(SettingsService.getValue).mockResolvedValue(customText);

    const existingBio = `I love music!\n\n${customText} "Old Song" by Old Artist`;
    const generator = await ProfileDescriptionGenerator.create(
      { description: existingBio } as any,
      mockTrack,
    );
    const result = generator.call();

    expect(result).toBe(
      `I love music!\n\n${customText}"Test Song" by Test Artist`,
    );
  });

  it("should replace existing now playing section with different prefix", async () => {
    const oldPrefix = "🎵 Now Playing: ";
    const newPrefix = "🎧 Currently vibing to: ";

    vi.mocked(SettingsService.getValue).mockResolvedValue(newPrefix);

    const existingBio = `I love music!\n\n${oldPrefix}"Old Song" by Old Artist`;

    const generator = await ProfileDescriptionGenerator.create(
      { description: existingBio } as any,
      mockTrack,
    );

    const result = generator.call();

    // Should use the new prefix from settings
    expect(result).toBe(
      `I love music!\n\n${newPrefix}"Test Song" by Test Artist`,
    );
  });
});

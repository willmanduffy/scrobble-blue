import { describe, it, expect, vi, beforeEach } from "vitest";
import { SettingsService } from "./settings";

declare global {
  var ASSETS: {
    fetch: (path: string) => Promise<Response>;
  };
}

// Mock ASSETS global
global.ASSETS = {
  fetch: vi.fn(),
};

describe("SettingsService", () => {
  const mockSettings = {
    "bio-now-playing-text": '🎵 Test: "{song}" by {artist}',
  };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should return default value when settings file does not exist", async () => {
    vi.mocked(ASSETS.fetch).mockRejectedValueOnce(new Error("Not found"));

    const defaultValue = '🎵 Default: "{song}" by {artist}';
    const result = await SettingsService.getValue(
      "bio-now-playing-text",
      defaultValue,
    );

    expect(result).toBe(defaultValue);
    expect(ASSETS.fetch).toHaveBeenCalledWith("settings.json");
  });

  it("should return value from settings file when it exists", async () => {
    vi.mocked(ASSETS.fetch).mockResolvedValueOnce({
      json: () => Promise.resolve(mockSettings),
    } as Response);

    const defaultValue = '🎵 Default: "{song}" by {artist}';
    const result = await SettingsService.getValue(
      "bio-now-playing-text",
      defaultValue,
    );

    expect(result).toBe(mockSettings["bio-now-playing-text"]);
    expect(ASSETS.fetch).toHaveBeenCalledWith("settings.json");
  });

  it("should return default value when key does not exist in settings", async () => {
    vi.mocked(ASSETS.fetch).mockResolvedValueOnce({
      json: () => Promise.resolve({}),
    } as Response);

    const defaultValue = '🎵 Default: "{song}" by {artist}';
    const result = await SettingsService.getValue(
      "bio-now-playing-text",
      defaultValue,
    );

    expect(result).toBe(defaultValue);
    expect(ASSETS.fetch).toHaveBeenCalledWith("settings.json");
  });
});

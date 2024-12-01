import { describe, it, expect } from "vitest";
import { ProfileDescriptionGenerator } from "./profile-description-generator";
import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { track } from "../../tests/fixtures/track";

describe("ProfileDescriptionGenerator", () => {
  it("should generate description with only now playing when no existing description", () => {
    const generator = new ProfileDescriptionGenerator(undefined, track);

    expect(generator.call()).toBe('🎵 Now Playing: "Test Song" by Test Artist');
  });

  it("should append now playing to existing description", () => {
    const profile: ProfileViewDetailed = {
      did: "test-did",
      handle: "test.handle",
      description: "My cool profile",
    } as ProfileViewDetailed;

    const generator = new ProfileDescriptionGenerator(profile, track);

    expect(generator.call()).toBe(
      'My cool profile\n\n🎵 Now Playing: "Test Song" by Test Artist',
    );
  });

  it("should update existing now playing section", () => {
    const profile: ProfileViewDetailed = {
      did: "test-did",
      handle: "test.handle",
      description:
        'My cool profile\n\n🎵 Now Playing: "Old Song" by Old Artist',
    } as ProfileViewDetailed;

    const generator = new ProfileDescriptionGenerator(profile, track);

    expect(generator.call()).toBe(
      'My cool profile\n\n🎵 Now Playing: "Test Song" by Test Artist',
    );
  });

  it("should handle empty description", () => {
    const profile: ProfileViewDetailed = {
      did: "test-did",
      handle: "test.handle",
      description: "",
    } as ProfileViewDetailed;

    const generator = new ProfileDescriptionGenerator(profile, track);

    expect(generator.call()).toBe('🎵 Now Playing: "Test Song" by Test Artist');
  });

  it("should handle description with opening newlines and now playing", () => {
    const profile: ProfileViewDetailed = {
      did: "test-did",
      handle: "test.handle",
      description: "\n\n🎵 Now Playing: 'Old Song' by Old Artist",
    } as ProfileViewDetailed;

    const generator = new ProfileDescriptionGenerator(profile, track);

    expect(generator.call()).toBe('🎵 Now Playing: "Test Song" by Test Artist');
  });

  it("should handle description with only now playing", () => {
    const profile: ProfileViewDetailed = {
      did: "test-did",
      handle: "test.handle",
      description: '🎵 Now Playing: "Old Song" by Old Artist',
    } as ProfileViewDetailed;

    const generator = new ProfileDescriptionGenerator(profile, track);

    expect(generator.call()).toBe('🎵 Now Playing: "Test Song" by Test Artist');
  });
});

import { vi } from "vitest";
import { Env } from "../../src/types";

export const mockEnv: Env = {
  BLUESKY_SESSION_STORAGE: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  } as unknown as KVNamespace,
  BSKY_PASSWORD: "test-password",
  BSKY_USERNAME: "test-user",
  LASTFM_API_KEY: "test-api-key",
  LASTFM_USERNAME: "test-user",
};

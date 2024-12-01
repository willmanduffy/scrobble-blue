import {
  AtpAgent,
  AppBskyActorDefs,
  AtpSessionEvent,
  AtpSessionData,
} from "@atproto/api";

import { Env } from "../types";
import { RateLimitError } from "../errors";
import { BlueskyRateLimitExceededError } from "../types/bluesky";

const SESSION_KEY = "session";

export class BlueSky {
  private agent: AtpAgent;

  constructor(env: Env) {
    this.agent = new AtpAgent({
      service: env.BSKY_SERVICE ?? "https://bsky.social",
      persistSession: async (
        _: AtpSessionEvent,
        sessionData?: AtpSessionData,
      ) => {
        await env.BLUESKY_SESSION_STORAGE.put(
          SESSION_KEY,
          JSON.stringify(sessionData),
        );
      },
    });
  }

  static async retrieveAgent(env: Env): Promise<BlueSky> {
    try {
      const bluesky = new BlueSky(env);

      const existingSessionData =
        await env.BLUESKY_SESSION_STORAGE.get(SESSION_KEY);

      if (existingSessionData) {
        const sessionData = JSON.parse(existingSessionData);

        await bluesky.agent.resumeSession(sessionData);
      } else {
        await bluesky.login(env.BSKY_USERNAME, env.BSKY_PASSWORD);
      }

      return bluesky;
    } catch (error: unknown) {
      if (isRateLimitError(error)) {
        throw new RateLimitError(
          `Rate limited until ${error.headers["ratelimit-reset"]}`,
        );
      }

      throw error;
    }
  }

  async getProfile(): Promise<
    AppBskyActorDefs.ProfileViewDetailed | undefined
  > {
    try {
      const response = await this.agent.getProfile({
        actor: this.agent.session?.did || "",
      });

      if (!response.success) {
        throw new Error("Failed to fetch profile");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to get profile:", error);
      return undefined;
    }
  }

  async postMessage(text: string): Promise<void> {
    try {
      await this.agent.post({
        text,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to post message:", error);
      throw error;
    }
  }

  async updateDescription(description: string): Promise<void> {
    try {
      await this.agent.upsertProfile((existing) => ({
        ...existing,
        description,
      }));
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  }

  private async login(username: string, password: string): Promise<void> {
    await this.agent.login({
      identifier: username,
      password: password,
    });
  }
}

const isRateLimitError = (
  error: unknown,
): error is BlueskyRateLimitExceededError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    error.error === "RateLimitExceeded" &&
    "headers" in error
  );
};

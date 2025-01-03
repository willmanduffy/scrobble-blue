import {
  AtpAgent,
  AppBskyActorDefs,
  AtpSessionEvent,
  AtpSessionData,
  RichText,
} from "@atproto/api";

import { Env } from "../types/env";
import { RateLimitError } from "../errors";
import { BlueskyRateLimitExceededError } from "../types/bluesky";

const SESSION_KEY = "session";

interface PostMessageOptions {
  altText?: string;
  aspectRatio?: {
    width: number;
    height: number;
  };
  embedImage?: Blob;
}

export class BlueSky {
  private agent: AtpAgent;

  constructor(env: Env) {
    this.agent = new AtpAgent({
      service: env.BSKY_SERVICE ?? "https://bsky.social",
      persistSession: async (
        _: AtpSessionEvent,
        sessionData?: AtpSessionData,
      ) => {
        const stringifiedSessionData = JSON.stringify(sessionData);

        const existingSessionData =
          await env.BLUESKY_SESSION_STORAGE.get(SESSION_KEY);

        // Protect the number of writes we make to KV to avoid hitting the limits
        // of Cloudflare's free tier.
        if (existingSessionData !== stringifiedSessionData) {
          await env.BLUESKY_SESSION_STORAGE.put(
            SESSION_KEY,
            JSON.stringify(sessionData),
          );
        }
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

  async postMessage(
    text: string,
    options: PostMessageOptions = {},
  ): Promise<void> {
    try {
      let embed;

      if (options.embedImage) {
        const uploadResponse = await this.agent.uploadBlob(options.embedImage, {
          encoding: "image/jpeg",
        });

        embed = {
          $type: "app.bsky.embed.images",
          images: [
            {
              alt: options.altText,
              image: uploadResponse.data.blob,
              aspectRatio: options.aspectRatio,
            },
          ],
        };
      }

      const richText = new RichText({ text });

      await richText.detectFacets(this.agent);

      await this.agent.post({
        text: richText.text,
        facets: richText.facets,
        embed,
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

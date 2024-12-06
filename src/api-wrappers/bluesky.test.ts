import { describe, it, expect, vi, beforeEach } from "vitest";
import { BlueSky } from "./bluesky";
import {
  AtpAgent,
  ComAtprotoServerCreateSession,
  RichText,
} from "@atproto/api";
import { mockEnv } from "../../tests/fixtures/env";
import { RateLimitError } from "../errors";

type CreateSessionResponse = ComAtprotoServerCreateSession.Response;

type HeadersMap = { [key: string]: string };

vi.mock("@atproto/api", () => {
  const mockPost = vi.fn();
  const mockGetProfile = vi.fn();
  const mockUpsertProfile = vi.fn();
  const mockLogin = vi.fn();
  const mockResumeSession = vi.fn();

  return {
    AtpAgent: vi.fn(() => ({
      post: mockPost,
      getProfile: mockGetProfile,
      upsertProfile: mockUpsertProfile,
      login: mockLogin,
      resumeSession: mockResumeSession,
      session: { did: "test-did" },
    })),
    RichText: vi.fn().mockImplementation(({ text }) => ({
      text,
      facets: [],
      detectFacets: vi.fn(),
    })),
  };
});

describe("BlueSky", () => {
  let agent: AtpAgent;

  beforeEach(() => {
    vi.clearAllMocks();

    agent = new AtpAgent({ service: mockEnv.BSKY_SERVICE ?? "" });
  });

  const mockHeaders: HeadersMap = {
    "content-type": "application/json; charset=utf-8",
  };

  describe("retrieveAgent", () => {
    it("should throw if login fails", async () => {
      vi.mocked(agent.login).mockRejectedValueOnce(new Error("Login failed"));

      await expect(BlueSky.retrieveAgent(mockEnv)).rejects.toThrow(
        "Login failed",
      );
    });

    it("should resume session if valid session exists in KV", async () => {
      const mockSession = {
        did: "test-did",
        handle: "test.handle",
        email: "test@example.com",
        accessJwt: "test-jwt",
        refreshJwt: "test-refresh-jwt",
      };

      vi.mocked(mockEnv.BLUESKY_SESSION_STORAGE.get).mockResolvedValueOnce(
        JSON.stringify(mockSession) as any,
      );

      const bluesky = await BlueSky.retrieveAgent(mockEnv);

      expect(mockEnv.BLUESKY_SESSION_STORAGE.get).toHaveBeenCalledWith(
        "session",
      );
      expect(agent.resumeSession).toHaveBeenCalledWith(mockSession);
      expect(agent.login).not.toHaveBeenCalled();
      expect(bluesky).toBeInstanceOf(BlueSky);
    });

    it("should login if no session exists in KV", async () => {
      vi.mocked(mockEnv.BLUESKY_SESSION_STORAGE.get).mockResolvedValueOnce(
        null,
      );

      const mockLoginResponse = {
        success: true,
        headers: mockHeaders,
        data: {
          did: "test-did",
          handle: "test.handle",
          email: "test@example.com",
          accessJwt: "test-jwt",
          refreshJwt: "test-refresh-jwt",
        },
      };

      vi.mocked(agent.login).mockResolvedValueOnce(mockLoginResponse);

      const bluesky = await BlueSky.retrieveAgent(mockEnv);

      expect(mockEnv.BLUESKY_SESSION_STORAGE.get).toHaveBeenCalledWith(
        "session",
      );

      expect(agent.login).toHaveBeenCalledWith({
        identifier: mockEnv.BSKY_USERNAME,
        password: mockEnv.BSKY_PASSWORD,
      });

      expect(bluesky).toBeInstanceOf(BlueSky);
    });

    it("should handle rate limiting during login", async () => {
      vi.mocked(mockEnv.BLUESKY_SESSION_STORAGE.get).mockResolvedValueOnce(
        null,
      );

      const mockRateLimitError = {
        error: "RateLimitExceeded",
        headers: {
          "ratelimit-limit": "100",
          "ratelimit-policy": "100;w=86400",
          "ratelimit-remaining": "0",
          "ratelimit-reset": "1733077560",
        },
      };

      vi.mocked(agent.login).mockRejectedValueOnce(mockRateLimitError);

      const promise = BlueSky.retrieveAgent(mockEnv);

      await expect(promise).rejects.toThrow(RateLimitError);
      await expect(promise).rejects.toThrow("Rate limited until 1733077560");
    });

    it("should pass through other errors during login", async () => {
      vi.mocked(mockEnv.BLUESKY_SESSION_STORAGE.get).mockResolvedValueOnce(
        null,
      );

      const originalError = new Error("Some other error");
      vi.mocked(agent.login).mockRejectedValueOnce(originalError);

      const promise = BlueSky.retrieveAgent(mockEnv);

      await expect(promise).rejects.toThrow(originalError);
    });
  });

  describe("postMessage", () => {
    it("should post a message successfully", async () => {
      const mockLoginResponse: CreateSessionResponse = {
        success: true,
        headers: mockHeaders,
        data: {
          did: "test-did",
          handle: "test.handle",
          email: "test@example.com",
          accessJwt: "test-jwt",
          refreshJwt: "test-refresh-jwt",
        },
      };

      vi.mocked(agent.login).mockResolvedValueOnce(mockLoginResponse);

      const mockRichText = new RichText({ text: "Test message" });
      vi.mocked(RichText).mockReturnValueOnce(mockRichText);

      vi.mocked(agent.post).mockResolvedValueOnce({
        uri: "at://test-did/app.bsky.feed.post/test",
        cid: "test-cid",
      });

      const bluesky = await BlueSky.retrieveAgent(mockEnv);
      const message = "Test message";

      await bluesky.postMessage(message);

      expect(agent.post).toHaveBeenCalledWith({
        text: mockRichText.text,
        facets: mockRichText.facets,
        createdAt: expect.any(String),
      });
    });
  });

  describe("getProfile", () => {
    it("should fetch profile successfully", async () => {
      const mockLoginResponse: CreateSessionResponse = {
        success: true,
        headers: mockHeaders,
        data: {
          did: "test-did",
          handle: "test.handle",
          email: "test@example.com",
          accessJwt: "test-jwt",
          refreshJwt: "test-refresh-jwt",
        },
      };

      vi.mocked(agent.login).mockResolvedValueOnce(mockLoginResponse);

      const mockProfile = {
        did: "test-did",
        handle: "test.handle",
        displayName: "Test User",
        description: "Test description",
      };

      vi.mocked(agent.getProfile).mockResolvedValueOnce({
        success: true,
        headers: mockHeaders,
        data: mockProfile,
      });

      const bluesky = await BlueSky.retrieveAgent(mockEnv);
      const profile = await bluesky.getProfile();

      expect(agent.getProfile).toHaveBeenCalledWith({
        actor: "test-did",
      });
      expect(profile).toEqual(mockProfile);
    });
  });

  describe("updateDescription", () => {
    it("should update description successfully", async () => {
      const mockLoginResponse: CreateSessionResponse = {
        success: true,
        headers: mockHeaders,
        data: {
          did: "test-did",
          handle: "test.handle",
          email: "test@example.com",
          accessJwt: "test-jwt",
          refreshJwt: "test-refresh-jwt",
        },
      };

      vi.mocked(agent.login).mockResolvedValueOnce(mockLoginResponse);

      vi.mocked(agent.upsertProfile).mockResolvedValue();

      const bluesky = await BlueSky.retrieveAgent(mockEnv);
      const newDescription = "New description";

      await bluesky.updateDescription(newDescription);

      expect(agent.upsertProfile).toHaveBeenCalled();
    });

    it("should throw if update fails", async () => {
      const mockLoginResponse: CreateSessionResponse = {
        success: true,
        headers: mockHeaders,
        data: {
          did: "test-did",
          handle: "test.handle",
          email: "test@example.com",
          accessJwt: "test-jwt",
          refreshJwt: "test-refresh-jwt",
        },
      };

      vi.mocked(agent.login).mockResolvedValueOnce(mockLoginResponse);

      vi.mocked(agent.upsertProfile).mockRejectedValueOnce(
        new Error("Update failed"),
      );

      const bluesky = await BlueSky.retrieveAgent(mockEnv);
      await expect(bluesky.updateDescription("test")).rejects.toThrow(
        "Update failed",
      );
    });
  });
});

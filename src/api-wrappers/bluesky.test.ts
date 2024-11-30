import { describe, it, expect, vi, beforeEach } from "vitest";
import { BlueSky } from "./bluesky";
import { AtpAgent, ComAtprotoServerCreateSession } from "@atproto/api";
import { mockEnv } from "../../tests/fixtures/env";

type CreateSessionResponse = ComAtprotoServerCreateSession.Response;

type HeadersMap = { [key: string]: string };

vi.mock("@atproto/api", () => {
  const mockPost = vi.fn();
  const mockGetProfile = vi.fn();
  const mockUpsertProfile = vi.fn();
  const mockLogin = vi.fn();

  return {
    AtpAgent: vi.fn(() => ({
      post: mockPost,
      getProfile: mockGetProfile,
      upsertProfile: mockUpsertProfile,
      login: mockLogin,
      session: { did: "test-did" },
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

  describe("createAgent", () => {
    it("should create an agent and login successfully", async () => {
      const mockResponse: CreateSessionResponse = {
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

      vi.mocked(agent.login).mockResolvedValueOnce(mockResponse);

      const bluesky = await BlueSky.createAgent(mockEnv);

      expect(agent.login).toHaveBeenCalledWith({
        identifier: mockEnv.BSKY_USERNAME,
        password: mockEnv.BSKY_PASSWORD,
      });
      expect(bluesky).toBeInstanceOf(BlueSky);
    });

    it("should throw if login fails", async () => {
      vi.mocked(agent.login).mockRejectedValueOnce(new Error("Login failed"));

      await expect(BlueSky.createAgent(mockEnv)).rejects.toThrow(
        "Login failed",
      );
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

      vi.mocked(agent.post).mockResolvedValueOnce({
        uri: "at://test-did/app.bsky.feed.post/test",
        cid: "test-cid",
      });

      const bluesky = await BlueSky.createAgent(mockEnv);
      const message = "Test message";

      await bluesky.postMessage(message);

      expect(agent.post).toHaveBeenCalledWith({
        text: message,
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

      const bluesky = await BlueSky.createAgent(mockEnv);
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

      const bluesky = await BlueSky.createAgent(mockEnv);
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

      const bluesky = await BlueSky.createAgent(mockEnv);
      await expect(bluesky.updateDescription("test")).rejects.toThrow(
        "Update failed",
      );
    });
  });
});

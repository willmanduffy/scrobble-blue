import { describe, it, expect, vi } from "vitest";
import { WeeklyTopArtistsImageGenerator } from "./weekly-top-artists-image-generator";

vi.mock("workers-og", () => ({
  ImageResponse: vi.fn().mockImplementation(() => new Response()),
  loadGoogleFont: vi.fn().mockResolvedValue(new Uint8Array()),
}));

// Mock Canvas API
class MockOffscreenCanvas {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  getContext() {
    return {
      fillStyle: "",
      fillRect: vi.fn(),
      fillText: vi.fn(),
      drawImage: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      arcTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
    };
  }

  convertToBlob() {
    return Promise.resolve(new Blob());
  }
}

// @ts-ignore
global.OffscreenCanvas = MockOffscreenCanvas;
global.createImageBitmap = vi.fn().mockResolvedValue({});

describe("WeeklyTopArtistsImageGenerator", () => {
  it("should generate an image with artists", async () => {
    const artists = [
      {
        name: "Top Artist",
        playcount: 100,
        image: "https://example.com/image.jpg",
      },
      {
        name: "Second Artist",
        playcount: 80,
        image: "https://example.com/image2.jpg",
      },
      {
        name: "Third Artist",
        playcount: 60,
        image: "https://example.com/image3.jpg",
      },
    ];

    const generator = new WeeklyTopArtistsImageGenerator(artists);
    const result = await generator.generate();
    expect(result).toBeInstanceOf(Response);
  });

  it("should return undefined when no artists provided", async () => {
    const generator = new WeeklyTopArtistsImageGenerator([]);
    const result = await generator.generate();
    expect(result).toBeUndefined();
  });

  it("should return undefined when main artist has no image", async () => {
    const artists = [
      {
        name: "Top Artist",
        playcount: 100,
        image: undefined,
      },
    ];

    const generator = new WeeklyTopArtistsImageGenerator(artists);
    const result = await generator.generate();
    expect(result).toBeUndefined();
  });
});

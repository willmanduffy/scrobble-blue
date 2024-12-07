/// <reference lib="dom" />

import { ImageResponse, loadGoogleFont } from "workers-og";
import { NormalizedWeeklyTopArtist } from "../types/weekly-top-artist";
import { weeklyTopArtistsImageTemplate } from "./weekly-top-artists-image-template";

export class WeeklyTopArtistsImageGenerator {
  static width = 1200;
  static height = 630;

  constructor(private artists: NormalizedWeeklyTopArtist[]) {}

  async altText(): Promise<string> {
    let altText = "A weekly chart of top artists.\n\n";

    this.artists.forEach((artist, index) => {
      altText += `#${index + 1}: ${artist.name} with ${artist.playcount} plays\n`;
    });

    return altText;
  }

  async generate(): Promise<ImageResponse | undefined> {
    if (!this.artists.length) {
      return;
    }

    const mainArtist = this.artists[0];

    // For now, we only support main artists with images will design a fallback approach later
    if (!mainArtist?.image) {
      return;
    }

    const html = weeklyTopArtistsImageTemplate(mainArtist, this.artists);

    return new ImageResponse(html, {
      width: WeeklyTopArtistsImageGenerator.width,
      height: WeeklyTopArtistsImageGenerator.height,
      fonts: [
        {
          name: "Inter",
          data: await loadGoogleFont({ family: "Inter" }),
        },
      ],
    });
  }
}

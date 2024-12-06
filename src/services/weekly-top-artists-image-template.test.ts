import { describe, it, expect } from "vitest";
import { weeklyTopArtistsImageTemplate } from "./weekly-top-artists-image-template";
import { NormalizedWeeklyTopArtist } from "../types/weekly-top-artist";

describe("weeklyTopArtistsImageTemplate", () => {
  it("should include main artist name, image and playcount", () => {
    const mainArtist: NormalizedWeeklyTopArtist = {
      name: "Test Artist",
      playcount: 100,
      image: "https://example.com/image.jpg",
    };

    const html = weeklyTopArtistsImageTemplate(mainArtist, [mainArtist]);

    expect(html).toContain(mainArtist.name);
    expect(html).toContain(`${mainArtist.playcount} plays`);
    expect(html).toContain(mainArtist.image);
    expect(html).toContain("TOP ARTIST");
  });

  it("should list all artists with their playcounts", () => {
    const artists: NormalizedWeeklyTopArtist[] = [
      { name: "Artist 1", playcount: 100, image: "url1" },
      { name: "Artist 2", playcount: 80, image: "url2" },
      { name: "Artist 3", playcount: 60, image: "url3" },
    ];

    const mainArtist = artists[0]!;
    const html = weeklyTopArtistsImageTemplate(mainArtist, artists);

    artists.forEach((artist, index) => {
      expect(html).toContain(artist.name);
      expect(html).toContain(`${artist.playcount} plays`);
      expect(html).toContain(`>${index + 1}<`); // Check ranking number
    });
  });

  it("should include branding elements", () => {
    const mainArtist: NormalizedWeeklyTopArtist = {
      name: "Test Artist",
      playcount: 100,
      image: "url",
    };

    const html = weeklyTopArtistsImageTemplate(mainArtist, [mainArtist]);

    expect(html).toContain("scrobble.blue");
    expect(html).toContain("Top artists");
    expect(html).toContain("of the week");
  });

  it("should handle special characters in artist names", () => {
    const mainArtist: NormalizedWeeklyTopArtist = {
      name: "Artist & Co.",
      playcount: 100,
      image: "url",
    };

    const html = weeklyTopArtistsImageTemplate(mainArtist, [mainArtist]);

    expect(html).toContain("Artist & Co.");
  });
});

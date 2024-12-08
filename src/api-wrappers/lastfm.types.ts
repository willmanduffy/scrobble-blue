// Data Types
export interface Artist {
  name: string;
  playcount: string;
  url: string;
  image: {
    "#text": string;
    size: "small" | "medium" | "large" | "extralarge" | "mega" | "";
  }[];
}
export interface RecentTrack {
  name: string;
  artist: {
    "#text": string;
    mbid?: string;
  };
  album: {
    "#text": string;
    mbid?: string;
  };
  url: string;
  date?: {
    uts: string;
    "#text": string | number;
  };
  "@attr"?: {
    nowplaying: string;
  };
}

// Request Responses
export interface RecentTracksResponse {
  recenttracks: {
    track: RecentTrack[];
  };
}

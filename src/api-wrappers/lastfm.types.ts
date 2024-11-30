// Data Types
export interface RecentTrack {
  artist: {
    "#text": string;
    mbid: string;
  };
  name: string;
  album: {
    "#text": string;
    mbid: string;
  };
  url: string;
  date?: {
    uts: string;
    "#text": string;
  };
}

// Request Responses
export interface RecentTracksResponse {
  recenttracks: {
    track: RecentTrack[];
  };
}

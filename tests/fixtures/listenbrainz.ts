import { InsertedListen } from "@kellnerd/listenbrainz/listen";

export const mockListen: InsertedListen = {
  listened_at: 1234567890,
  inserted_at: 1234567890,
  track_metadata: {
    track_name: "Test Song",
    artist_name: "Test Artist",
    release_name: "Test Album",
    additional_info: {
      listening_from: "Test Source",
      music_service: "Test Service",
    },
  },
  user_name: "test-user",
  recording_msid: "test-recording-id",
};

export interface BlueskyRateLimitExceededError {
  name: "RateLimitExceeded";
  headers: {
    "ratelimit-limit": string;
    "ratelimit-policy": string;
    "ratelimit-remaining": string;
    "ratelimit-reset": string;
  };
  statusText: string;
}

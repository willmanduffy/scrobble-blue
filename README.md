# Scrobble Blue

A Bluesky integration that:
1. Updates your profile description with your currently playing track from Last.fm or ListenBrainz
2. Posts your weekly top 5 artists every Friday at 15:00 UTC (Last.fm only)

This application requires a Bluesky account and at least one scrobble service API key. You can use the free tier of Cloudflare for this application.

## Features

### Profile Description Updates
Updates your Bluesky profile description with your currently playing track. This runs every minute and will update your profile if you're currently scrobbling a track.

- Supports both Last.fm and ListenBrainz
- When both services are configured, uses the most recently scrobbled track
- Updates every minute
- Only updates when there's a new track playing

![Profile Description Example](https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:wnakkpxj4ndea7yetar7y7zq/bafkreibcfaffmp4345plad6kj2qsqxvc5wupaq4k5tjbrzkfpmuukhrlnm@jpeg)

### Weekly Top 5 Artists
Every Friday at 15:00 UTC, posts an image to your Bluesky feed showing your top 5 most played artists from the past week.

- Currently supports Last.fm only
- Posts automatically every Friday at 15:00 UTC
- Generates a custom image with your top 5 artists of the last week.
- Includes play counts for each artist

![Weekly Top 5 Artists Example](https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:wnakkpxj4ndea7yetar7y7zq/bafkreih7bmoopjgq2oqlkd7o5fvks6nx5decj23b7ywuoisaseg7qqizey@jpeg)

## Prerequisites

### Cloudflare Account

This is a Cloudflare worker, so you'll need an account.

- Sign up at [Cloudflare](https://dash.cloudflare.com/sign-up)
- Install Wrangler: `npm install -g wrangler`
- Run `wrangler login`

### Bluesky App Password
- Log into [Bluesky](https://bsky.app)
- Go to Settings → App Passwords
- Create a new app password. You can use your real password, but it's recommended to create a new one for this app that can be revoked if necessary. This also allows you to login even if you have MFA enabled.

### Scrobble Services

You need to set up at least one of these services:

#### Last.fm
- Create an account at [Last.fm](https://www.last.fm)
- Get API credentials from [Last.fm API](https://www.last.fm/api/account/create)

#### ListenBrainz
- Create an account at [ListenBrainz](https://listenbrainz.org)
- Get your API token from [Profile Settings](https://listenbrainz.org/profile/)

Note: The weekly top 5 artists feature currently only works with Last.fm. If both services are configured for profile updates, Scrobble Blue will automatically use the most recently scrobbled track from either service.

## Setup

1. Clone the repository:
   ```bash
   git clone git@github.com:willmanduffy/scrobble-blue.git
   cd scrobble-blue
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a KV namespace:
   - Go to your [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to Workers & Pages → KV
   - Click "Create a namespace"
   - Name it `BLUESKY_SESSION_STORAGE`
   - Copy the ID of the newly created namespace

4. Configure environment variables:
   ```bash
   cp .dev.vars.example .dev.vars
   cp wrangler.toml.example wrangler.toml
   ```

   Fill out `.dev.vars` with your credentials and replace the KV_ID in `wrangler.toml` with your copied KV namespace ID. It should look like this:
   ```toml
   kv_namespaces = [
     { binding = "BLUESKY_SESSION_STORAGE", id = "your-kv-namespace-id" }
   ]
   ```

5. Configure settings (optional):
   ```bash
   cp settings.json.example settings.json
   ```

   The `settings.json` file allows you to customize various aspects of the application. If you're using VS Code, you'll get autocompletion and validation for the settings.

   Available settings:
   - `bio-now-playing-text`: The text prefix used for the "Now Playing" section in your bio (default: "🎵 Now playing:")

   Example `settings.json`:
   ```json
   {
     "bio-now-playing-text": "🎧 Currently vibing to: "
   }
   ```

6. Deploy secrets to Cloudflare:

   ```bash
   wrangler secret put BSKY_USERNAME
   wrangler secret put BSKY_PASSWORD
   # For Last.fm
   wrangler secret put LASTFM_API_KEY
   wrangler secret put LASTFM_SECRET
   wrangler secret put LASTFM_USERNAME
   # For ListenBrainz
   wrangler secret put LISTENBRAINZ_TOKEN
   wrangler secret put LISTENBRAINZ_USERNAME
   ```

7. Deploy the worker:
   ```bash
   wrangler deploy
   ```

## Development

Run locally:

```bash
wrangler dev --test-scheduled
```

To test the different scheduled tasks locally:

```bash
# Test currently playing track sync
curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"

# Test weekly top artists post (Last.fm only)
curl "http://localhost:8787/__scheduled?cron=0+15+*+*+6"
```

To run tests:

```bash
npx vitest
```

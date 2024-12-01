# Scrobble Blue

Update your Bluesky profile description with your currently playing track from Last.fm or ListenBrainz. This application requires a Bluesky account and at least one scrobble service API key. You can use the free tier of Cloudflare for this application.

![Screenshot](https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:wnakkpxj4ndea7yetar7y7zq/bafkreibcfaffmp4345plad6kj2qsqxvc5wupaq4k5tjbrzkfpmuukhrlnm@jpeg)

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

If both services are configured, Scrobble Blue will automatically use the most recently scrobbled track from either service.

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

5. Deploy secrets to Cloudflare:

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

6. Deploy the worker:
   ```bash
   wrangler deploy
   ```

## Development

Run locally:

```bash
wrangler dev --test-scheduled
```

To run a test of the sync function, once your worker is running, run:

```bash
curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
```

To run tests, run:

```bash
npx vitest
```

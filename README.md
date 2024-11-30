# Bluesky LastFM Integration

Updates your Bluesky profile description with your currently playing track from Last.fm.

## Prerequisites

1. **Cloudflare Account**

This is a Cloudflare worker, so you'll need an account.

   - Sign up at [Cloudflare](https://dash.cloudflare.com/sign-up)
   - Install Wrangler: `npm install -g wrangler`
   - Run `wrangler login`

2. **Last.fm API Account**
   - Create an account at [Last.fm](https://www.last.fm)
   - Get API credentials from [Last.fm API](https://www.last.fm/api/account/create)

3. **Bluesky App Password**
   - Log into [Bluesky](https://bsky.app)
   - Go to Settings → App Passwords
   - Create a new app password. You can use your real password, but it's recommended to create a new one for this app that can be revoked if necessary. This also allows you to login even if you have MFA enabled.

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

3. Configure environment variables:
   ```bash
   cp .dev.vars.example .dev.vars
   ```

   Fill out `.dev.vars` with your credentials.

4. Deploy secrets to Cloudflare:

   ```bash
   wrangler secret put BSKY_USERNAME
   wrangler secret put BSKY_PASSWORD
   wrangler secret put LASTFM_API_KEY
   wrangler secret put LASTFM_SECRET
   wrangler secret put LASTFM_USERNAME
   ```

5. Deploy the worker:
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

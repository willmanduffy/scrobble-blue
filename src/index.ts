/**
 * Welcome to Cloudflare Workers! This is your first scheduled worker.
 *
 * - Run `wrangler dev --local` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/cdn-cgi/mf/scheduled"` to trigger the scheduled event
 * - Go back to the console to see what your worker has logged
 * - Update the Cron trigger in wrangler.toml (see https://developers.cloudflare.com/workers/wrangler/configuration/#triggers)
 * - Run `wrangler deploy --name my-worker` to deploy your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/
 */

import { sync } from './services/sync';

export interface Env {
  LASTFM_API_KEY: string;
  LASTFM_USERNAME: string;
  BSKY_USERNAME: string;
  BSKY_PASSWORD: string;
  BSKY_SERVICE?: string;
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('Scheduled event started at:', new Date().toISOString());
    
    await sync(env);
  },
};

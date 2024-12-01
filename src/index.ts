import { sync } from "./services/sync";
import { Env } from "./types/env";

export default {
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    console.log("Scheduled event started at:", new Date().toISOString());

    await sync(env);
  },
};

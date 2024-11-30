import { AtpAgent, AppBskyActorDefs } from '@atproto/api';
import { Env } from '../types';

export class BlueSky {
  private agent: AtpAgent;

  constructor(service = 'https://bsky.social') {
    this.agent = new AtpAgent({ service });
  }

  static async createAgent(env: Env): Promise<BlueSky> {
    const bluesky = new BlueSky(env.BSKY_SERVICE);
    await bluesky.login(env.BSKY_USERNAME, env.BSKY_PASSWORD);

    return bluesky;
  }

  private async login(username: string, password: string): Promise<void> {
    await this.agent.login({
      identifier: username,
      password: password,
    });
  }

  async postMessage(text: string): Promise<void> {
    try {
      await this.agent.post({
        text,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to post message:', error);
      throw error;
    }
  }

  async getProfile(): Promise<AppBskyActorDefs.ProfileViewDetailed | undefined> {
    try {
      const response = await this.agent.getProfile({
        actor: this.agent.session?.did || '',
      });
      
      if (!response.success) {
        throw new Error('Failed to fetch profile');
      }

      return response.data;
    } catch (error) {
      console.error('Failed to get profile:', error);
      return undefined;
    }
  }

  async updateDescription(description: string): Promise<void> {
    try {
      await this.agent.upsertProfile((existing) => ({
        ...existing,
        description,
      }));
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }
}
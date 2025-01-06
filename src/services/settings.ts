import type { Settings } from "./settings.types";

declare const ASSETS: { fetch: (path: string) => Promise<Response> };

export class SettingsService {
  private static settings: Settings | null = null;

  private static async loadSettings(): Promise<Settings> {
    if (!this.settings) {
      try {
        const response = await ASSETS.fetch("settings.json");
        this.settings = await response.json();
      } catch (error) {
        console.error("Error loading settings:", error);
        this.settings = {};
      }
    }
    return this.settings as Settings;
  }

  static async getValue<K extends keyof Settings>(
    key: K,
    defaultValue: NonNullable<Settings[K]>,
  ): Promise<NonNullable<Settings[K]>> {
    const settings = await this.loadSettings();
    return settings[key] ?? defaultValue;
  }
}

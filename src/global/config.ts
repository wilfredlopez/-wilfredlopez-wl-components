import { WlConfig } from "./wl-config";

export class Config {
  private m = new Map<keyof WlConfig, any>();

  reset(configObj: WlConfig) {
    this.m = new Map<keyof WlConfig, any>(Object.entries(configObj) as any);
  }

  get(key: keyof WlConfig, fallback?: any): any {
    const value = this.m.get(key);
    return value !== undefined ? value : fallback;
  }

  getBoolean(key: keyof WlConfig, fallback = false): boolean {
    const val = this.m.get(key);
    if (val === undefined) {
      return fallback;
    }
    if (typeof val === "string") {
      return val === "true";
    }
    return !!val;
  }

  getNumber(key: keyof WlConfig, fallback?: number): number {
    const val = parseFloat(this.m.get(key));
    return isNaN(val) ? (fallback !== undefined ? fallback : NaN) : val;
  }

  set(key: keyof WlConfig, value: any) {
    this.m.set(key, value);
  }
}

export const config = /*@__PURE__*/ new Config();

export const configFromSession = (win: Window): any => {
  try {
    const configStr = win.sessionStorage.getItem(WL_SESSION_KEY);
    return configStr !== null ? JSON.parse(configStr) : {};
  } catch (e) {
    return {};
  }
};

export const saveConfig = (win: Window, c: any) => {
  try {
    win.sessionStorage.setItem(WL_SESSION_KEY, JSON.stringify(c));
  } catch (e) {
    return;
  }
};

export const configFromURL = (win: Window) => {
  const configObj: any = {};
  win.location.search
    .slice(1)
    .split("&")
    .map((entry) => entry.split("="))
    .map(([key, value]) => [decodeURIComponent(key), decodeURIComponent(value)])
    .filter(([key]) => startsWith(key, WL_PREFIX))
    .map(([key, value]) => [key.slice(WL_PREFIX.length), value])
    .forEach(([key, value]) => {
      configObj[key] = value;
    });

  return configObj;
};

const startsWith = (input: string, search: string): boolean => {
  return input.substr(0, search.length) === search;
};

const WL_PREFIX = "wl:";
const WL_SESSION_KEY = "wl-persist-config";

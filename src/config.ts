const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_PAGE_SIZE = 100;

export type BacklogConfig = {
  baseUrl: string;
  apiKey: string;
  timeoutMs: number;
  maxPageSize: number;
};

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parsePositiveInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return fallback;
  }

  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer`);
  }

  return value;
}

function normalizeBaseUrl(rawBaseUrl: string): string {
  let parsed: URL;
  try {
    parsed = new URL(rawBaseUrl);
  } catch {
    throw new Error("BACKLOG_BASE_URL must be a valid URL");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("BACKLOG_BASE_URL must use https");
  }

  parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString().replace(/\/+$/, "");
}

export function loadConfig(): BacklogConfig {
  return {
    baseUrl: normalizeBaseUrl(readRequiredEnv("BACKLOG_BASE_URL")),
    apiKey: readRequiredEnv("BACKLOG_API_KEY"),
    timeoutMs: parsePositiveInt("BACKLOG_TIMEOUT_MS", DEFAULT_TIMEOUT_MS),
    maxPageSize: parsePositiveInt("BACKLOG_MAX_PAGE_SIZE", DEFAULT_MAX_PAGE_SIZE),
  };
}

export function clampCount(count: number | undefined, maxPageSize: number, fallback = 20): number {
  if (count == null) {
    return fallback;
  }

  if (!Number.isInteger(count) || count <= 0) {
    throw new Error("count must be a positive integer");
  }

  return Math.min(count, maxPageSize);
}

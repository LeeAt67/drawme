export type ApiConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
  port: number;
  host: string;
  webDistDir: string | null;
  rateLimitPerMinute: number;
  sessionCookieName: string;
  sessionTtlMs: number;
  cookieSecure: boolean;
  authAdminEmail: string;
  authAdminPassword: string;
  authAdminPasswordHash: string;
  authRateLimitPerMinute: number;
  authDisabled: boolean;
  authOAuthProviders: AuthOAuthProvider[];
  allowedOrigins: string[];
};

/**
 * A sign-in method advertised to the browser. Password sign-in is built in;
 * OAuth providers only need a server-side start URL, so the callback can
 * create the same HttpOnly session as a password login.
 */
export type AuthOAuthProvider = {
  id: string;
  name: string;
  startUrl: string;
};

export const DEFAULT_AGENT_API_BASE_URL = 'https://api.openai.com/v1';
export const DEFAULT_AGENT_MODEL = 'gpt-4o-mini';
export const DEFAULT_AGENT_TIMEOUT_MS = 60_000;
export const DEFAULT_API_PORT = 8787;
export const DEFAULT_RATE_LIMIT_PER_MINUTE = 20;
export const DEFAULT_SESSION_COOKIE_NAME = 'drawme_session';
export const DEFAULT_SESSION_TTL_HOURS = 168;
export const DEFAULT_AUTH_ADMIN_EMAIL = 'admin@drawme.local';
export const DEFAULT_AUTH_RATE_LIMIT_PER_MINUTE = 10;
export const MAX_AUTH_OAUTH_PROVIDERS = 10;

const MIN_TIMEOUT_MS = 1_000;
const MAX_TIMEOUT_MS = 300_000;
const MIN_SESSION_TTL_HOURS = 1;
const MAX_SESSION_TTL_HOURS = 24 * 30;
const COOKIE_NAME_PATTERN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const OAUTH_PROVIDER_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,31}$/;

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '');
}

export function getChatCompletionsUrl(baseUrl: string): string {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  if (!normalizedBaseUrl) {
    return '';
  }
  if (/\/chat\/completions$/i.test(normalizedBaseUrl)) {
    return normalizedBaseUrl;
  }
  return `${normalizedBaseUrl}/chat/completions`;
}

function readInteger(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number
): number {
  const parsedValue = Number.parseInt((value || '').trim(), 10);
  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }
  return Math.min(Math.max(parsedValue, min), max);
}

function readOptionalString(value: string | undefined): string | null {
  const trimmedValue = (value || '').trim();
  return trimmedValue ? trimmedValue : null;
}

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  const normalizedValue = (value || '').trim().toLowerCase();
  if (!normalizedValue) {
    return fallback;
  }
  if (['1', 'true', 'yes', 'on'].includes(normalizedValue)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(normalizedValue)) {
    return false;
  }
  return fallback;
}

function readList(value: string | undefined): string[] {
  return (value || '')
    .split(',')
    .map((item) => item.trim().replace(/\/+$/, '').toLowerCase())
    .filter(Boolean);
}

function isSafeProviderStartUrl(value: string): boolean {
  if (value.startsWith('//')) {
    return false;
  }
  if (value.startsWith('/')) {
    return true;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Parses `AUTH_OAUTH_PROVIDERS`, a JSON array of `{ id, name, startUrl }`.
 * Invalid entries are dropped instead of failing startup: a broken optional
 * sign-in method must never take the whole API down.
 */
export function readAuthOAuthProviders(value: string | undefined): AuthOAuthProvider[] {
  const rawValue = (value || '').trim();
  if (!rawValue) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawValue);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) {
    return [];
  }

  const providers: AuthOAuthProvider[] = [];
  const seenIds = new Set<string>();
  for (const item of parsed) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const record = item as Record<string, unknown>;
    const id = typeof record.id === 'string' ? record.id.trim().toLowerCase() : '';
    const name = typeof record.name === 'string' ? record.name.trim() : '';
    const startUrl = typeof record.startUrl === 'string' ? record.startUrl.trim() : '';
    if (
      !OAUTH_PROVIDER_ID_PATTERN.test(id) ||
      !name ||
      !isSafeProviderStartUrl(startUrl) ||
      seenIds.has(id)
    ) {
      continue;
    }
    seenIds.add(id);
    providers.push({ id, name: name.slice(0, 60), startUrl });
    if (providers.length >= MAX_AUTH_OAUTH_PROVIDERS) {
      break;
    }
  }
  return providers;
}

function readCookieName(value: string | undefined, cookieSecure: boolean): string {
  const name =
    (value || '').trim() || (cookieSecure ? '__Host-drawme_session' : DEFAULT_SESSION_COOKIE_NAME);
  if (!COOKIE_NAME_PATTERN.test(name)) {
    throw new Error('SESSION_COOKIE_NAME contains invalid characters.');
  }
  if (name.startsWith('__Host-') && !cookieSecure) {
    throw new Error('SESSION_COOKIE_NAME starting with __Host- requires COOKIE_SECURE=true.');
  }
  return name;
}

export function readApiConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  const cookieSecure = readBoolean(env.COOKIE_SECURE, env.NODE_ENV === 'production');
  const devOrigins =
    env.NODE_ENV === 'production' ? [] : ['http://localhost:7200', 'http://127.0.0.1:7200'];

  return {
    baseUrl: normalizeBaseUrl(env.AGENT_API_BASE_URL || DEFAULT_AGENT_API_BASE_URL),
    apiKey: (env.AGENT_API_KEY || '').trim(),
    model: (env.AGENT_MODEL || DEFAULT_AGENT_MODEL).trim() || DEFAULT_AGENT_MODEL,
    timeoutMs: readInteger(
      env.AGENT_TIMEOUT_MS,
      DEFAULT_AGENT_TIMEOUT_MS,
      MIN_TIMEOUT_MS,
      MAX_TIMEOUT_MS
    ),
    port: readInteger(env.PORT, DEFAULT_API_PORT, 1, 65_535),
    host: (env.HOST || '0.0.0.0').trim() || '0.0.0.0',
    webDistDir: readOptionalString(env.WEB_DIST_DIR),
    rateLimitPerMinute: readInteger(
      env.AGENT_RATE_LIMIT_PER_MINUTE,
      DEFAULT_RATE_LIMIT_PER_MINUTE,
      0,
      10_000
    ),
    sessionCookieName: readCookieName(env.SESSION_COOKIE_NAME, cookieSecure),
    sessionTtlMs:
      readInteger(
        env.SESSION_TTL_HOURS,
        DEFAULT_SESSION_TTL_HOURS,
        MIN_SESSION_TTL_HOURS,
        MAX_SESSION_TTL_HOURS
      ) *
      60 *
      60 *
      1000,
    cookieSecure,
    authAdminEmail: (env.AUTH_ADMIN_EMAIL || DEFAULT_AUTH_ADMIN_EMAIL).trim().toLowerCase(),
    authAdminPassword: env.AUTH_ADMIN_PASSWORD || '',
    authAdminPasswordHash: (env.AUTH_ADMIN_PASSWORD_HASH || '').trim(),
    authRateLimitPerMinute: readInteger(
      env.AUTH_RATE_LIMIT_PER_MINUTE,
      DEFAULT_AUTH_RATE_LIMIT_PER_MINUTE,
      0,
      1_000
    ),
    authDisabled: readBoolean(env.AUTH_DISABLED, false),
    authOAuthProviders: readAuthOAuthProviders(env.AUTH_OAUTH_PROVIDERS),
    allowedOrigins: [...new Set([...devOrigins, ...readList(env.ALLOWED_ORIGINS)])],
  };
}

export function isAgentConfigured(config: ApiConfig): boolean {
  return Boolean(config.baseUrl && config.apiKey && config.model);
}

export function isAuthConfigured(config: ApiConfig): boolean {
  if (config.authDisabled) {
    return true;
  }
  return Boolean(
    config.authAdminEmail && (config.authAdminPasswordHash || config.authAdminPassword)
  );
}

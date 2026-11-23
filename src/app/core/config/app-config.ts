/**
 * Runtime configuration, fetched from /config.json before bootstrap so one image serves
 * every environment (the container writes the file from its env vars at start).
 */
export interface AppConfig {
  /** finco API base, e.g. /finco-api */
  apiUrl: string;
  /** authco issuer, e.g. https://demo.example/authco */
  authUrl: string;
  clientId: string;
  /** RFC 8707 resource: finco audience in authco tokens */
  resource: string;
}

let current: AppConfig | null = null;

export async function loadAppConfig(): Promise<void> {
  const response = await fetch('/config.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`config.json: HTTP ${response.status}`);
  }
  current = await response.json();
}

export function appConfig(): AppConfig {
  if (!current) {
    throw new Error('App config not loaded');
  }
  return current;
}

export const exchangeApiUrl = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/"

export const scope = "openid profile email"

export const redirectUri = () => `${appConfig().authUrl}/auth/callback`;
export const postLogoutRedirectUri = () => `${window.location.origin}/`;

/** Absolute API base: an absolute apiUrl (k3s) is kept as is, a relative one (docker) is resolved against the origin. */
export const absoluteApiUrl = () => new URL(appConfig().apiUrl, window.location.origin).toString().replace(/\/$/, '');

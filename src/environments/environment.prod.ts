// Production: values come from /env.js, written by the nginx container at startup from
// FINCO_API_URL, AUTHCO_URL, OAUTH_CLIENT_ID and FINCO_RESOURCE (see docker/40-finco-env.sh).
// The defaults fit a single host serving the SPA at /, finco at /finco-api and authco at /authco.
interface RuntimeEnv {
    FINCO_API_URL?: string;
    AUTHCO_URL?: string;
    OAUTH_CLIENT_ID?: string;
    FINCO_RESOURCE?: string;
}

const env: RuntimeEnv = (window as { __env?: RuntimeEnv }).__env ?? {};
const origin = window.location.origin;
/** Same-origin paths become absolute URLs where the OAuth protocol needs one. */
const absolute = (url: string) => (url.startsWith('/') ? origin + url : url);

const url = env.FINCO_API_URL || '/finco-api/v1';

export const environment = {
    "url": url,
    "exchangeApiUrl": "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/",
    // OAuth 2.1 Authorization Code + PKCE against authco (public client, no refresh tokens).
    // Absolute: it must equal the `iss` claim of the ID token.
    "authUrl": absolute(env.AUTHCO_URL || '/authco'),
    "clientId": env.OAUTH_CLIENT_ID || 'finco-site',
    "redirectUri": `${origin}/auth/callback`,
    "postLogoutRedirectUri": `${origin}/`,
    // RFC 8707 resource indicator: must be listed in authco's AUTHCO_RESOURCES.
    "resource": absolute(env.FINCO_RESOURCE || url),
    "scope": "openid profile email"
};

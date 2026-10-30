// Local development: `ng serve` on http://localhost:4200, finco on :8086, authco on :8087.
const origin = window.location.origin;

export const environment = {
    "url": "http://localhost:8086/finco-api/v1",
    "exchangeApiUrl": "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/",
    // OAuth 2.1 Authorization Code + PKCE against authco (public client, no refresh tokens).
    "authUrl": "http://localhost:8087/authco",
    "clientId": "finco-site",
    "redirectUri": `${origin}/auth/callback`,
    "postLogoutRedirectUri": `${origin}/`,
    // RFC 8707 resource indicator: must be listed in authco's AUTHCO_RESOURCES.
    "resource": "http://localhost:8086/finco-api/v1",
    "scope": "openid profile email"
};

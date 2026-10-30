import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '@src/environments/environment.local';
import { codeChallengeS256, randomString } from '@app/auth/utils/oauth-crypto';
import { decodeJwtPayload } from '@app/auth/utils/jwt';
import {
  AuthorizationResponse,
  OAuthError,
  PendingLogin,
  TokenResponse,
  TokenSet
} from '@app/auth/interfaces/oauth.interface';

const PENDING_LOGIN_KEY = 'finco.oauth.pending';
const SESSION_KEY = 'finco.auth.session';

/**
 * OAuth 2.1 Authorization Code + PKCE (S256) with authco, plus OIDC state/nonce and
 * RP-initiated logout. authco issues no refresh tokens to public clients, so when the
 * access token expires the user goes through an interactive login again.
 *
 * The session lives in sessionStorage: it dies with the tab and is never shared across tabs.
 */
@Injectable({
  providedIn: 'root'
})
export class OAuthService {

  private http = inject(HttpClient);

  private _session = signal<TokenSet | null>(readStoredSession());
  readonly session = this._session.asReadonly();

  /** Redirects the browser to the authco authorization endpoint. */
  async startLogin(returnUrl: string = '/'): Promise<void> {
    const pending = newPendingLogin(safeReturnUrl(returnUrl));
    sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify(pending));
    window.location.assign(await authorizeUrl(pending));
  }

  /** Validates the authorization response, exchanges the code and stores the session. Emits the return URL. */
  completeLogin(response: AuthorizationResponse): Observable<string> {
    const pending = this.takePendingLogin();
    return this.redeem(response, pending).pipe(
      tap((tokens) => this.storeSession(tokens)),
      map(() => pending!.returnUrl)
    );
  }

  /** Return URL of the login this tab started and has not completed yet; '/' if there is none. */
  pendingReturnUrl(): string {
    return safeReturnUrl(parseJson<PendingLogin>(sessionStorage.getItem(PENDING_LOGIN_KEY))?.returnUrl);
  }

  /** OIDC RP-initiated logout URL; ends the authco session and comes back to the app. */
  endSessionUrl(idToken: string): string {
    const params = new URLSearchParams({
      id_token_hint: idToken,
      client_id: environment.clientId,
      post_logout_redirect_uri: environment.postLogoutRedirectUri
    });
    return `${environment.authUrl}/connect/logout?${params}`;
  }

  clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    this._session.set(null);
  }

  private storeSession(tokens: TokenSet) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(tokens));
    this._session.set(tokens);
  }

  private redeem(response: AuthorizationResponse, pending: PendingLogin | null): Observable<TokenSet> {
    if (response.error) {
      return throwError(() => new OAuthError(response.error!, response.error_description ?? 'Authorization was denied'));
    }
    if (!pending || !response.code || response.state !== pending.state) {
      return throwError(() => new OAuthError('invalid_state', 'The login response does not match a login started here'));
    }

    const body = new HttpParams({
      fromObject: {
        grant_type: 'authorization_code',
        code: response.code,
        redirect_uri: environment.redirectUri,
        client_id: environment.clientId,
        code_verifier: pending.codeVerifier,
        resource: environment.resource
      }
    });
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<TokenResponse>(`${environment.authUrl}/oauth2/token`, body.toString(), { headers }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => new OAuthError(
        error.error?.error ?? 'token_request_failed',
        error.error?.error_description ?? 'Could not exchange the authorization code'))),
      map((tokens) => toTokenSet(tokens, pending.nonce))
    );
  }

  private takePendingLogin(): PendingLogin | null {
    const raw = sessionStorage.getItem(PENDING_LOGIN_KEY);
    sessionStorage.removeItem(PENDING_LOGIN_KEY);
    return parseJson<PendingLogin>(raw);
  }

}

/** Only same-app paths: never an absolute or protocol-relative URL (open redirect) nor /auth. */
export function safeReturnUrl(url: string | null | undefined): string {
  return url && /^\/(?![/\\]|auth(?:[/?#]|$))/.test(url) ? url : '/';
}

function newPendingLogin(returnUrl: string): PendingLogin {
  return {
    state: randomString(32),
    nonce: randomString(32),
    codeVerifier: randomString(64),
    returnUrl
  };
}

async function authorizeUrl(pending: PendingLogin): Promise<string> {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: environment.clientId,
    redirect_uri: environment.redirectUri,
    scope: environment.scope,
    state: pending.state,
    nonce: pending.nonce,
    code_challenge: await codeChallengeS256(pending.codeVerifier),
    code_challenge_method: 'S256',
    resource: environment.resource
  });
  return `${environment.authUrl}/oauth2/authorize?${params}`;
}

function toTokenSet(response: TokenResponse, nonce: string): TokenSet {
  if (!response.access_token || response.token_type?.toLowerCase() !== 'bearer') {
    throw new OAuthError('invalid_token_response', 'The token response has no bearer access token');
  }

  const idToken = response.id_token ?? null;
  if (idToken) {
    validateIdToken(idToken, nonce);
  }
  return { accessToken: response.access_token, idToken, expiresAt: expiresAt(response) };
}

// expires_in is only RECOMMENDED (RFC 6749 5.1): fall back to the access token `exp` claim.
function expiresAt(response: TokenResponse): number {
  if (typeof response.expires_in === 'number' && Number.isFinite(response.expires_in)) {
    return Date.now() + response.expires_in * 1000;
  }
  const exp = decodeJwtPayload(response.access_token)?.['exp'];
  if (typeof exp === 'number' && Number.isFinite(exp)) {
    return exp * 1000;
  }
  throw new OAuthError('invalid_token_response', 'The token response does not say when the access token expires');
}

// The ID token comes straight from the token endpoint over the back channel, so its
// signature need not be checked here (OIDC Core 3.1.3.7); its binding to this login does.
function validateIdToken(idToken: string, nonce: string): void {
  const claims = decodeJwtPayload(idToken);
  const aud = claims?.['aud'];
  const audiences = Array.isArray(aud) ? aud : [aud];
  if (!claims
    || claims['nonce'] !== nonce
    || !audiences.includes(environment.clientId)
    || typeof claims['iss'] !== 'string'
    || withoutTrailingSlash(claims['iss']) !== withoutTrailingSlash(environment.authUrl)) {
    throw new OAuthError('invalid_id_token', 'The ID token does not belong to this login');
  }
}

function withoutTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function readStoredSession(): TokenSet | null {
  return parseJson<TokenSet>(sessionStorage.getItem(SESSION_KEY));
}

function parseJson<T>(raw: string | null): T | null {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

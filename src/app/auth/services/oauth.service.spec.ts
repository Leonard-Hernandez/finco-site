import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '@src/environments/environment.local';
import { OAuthService, safeReturnUrl } from './oauth.service';
import { base64UrlEncode } from '@app/auth/utils/oauth-crypto';
import { OAuthError, PendingLogin } from '@app/auth/interfaces/oauth.interface';

const SESSION_KEY = 'finco.auth.session';
const PENDING_LOGIN_KEY = 'finco.oauth.pending';

const fakeJwt = (payload: object) =>
  `e30.${base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)))}.sig`;

const pending: PendingLogin = { state: 'the-state', nonce: 'the-nonce', codeVerifier: 'the-verifier', returnUrl: '/accounts' };

const idToken = (claims: object = {}) => fakeJwt({
  iss: environment.authUrl,
  aud: [environment.clientId],
  nonce: pending.nonce,
  ...claims
});

describe('OAuthService', () => {

  let service: OAuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify(pending));
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(OAuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  /** Completes the pending login with a token response; resolves with the emitted return URL or the error. */
  async function completeWith(tokens: object): Promise<string | unknown> {
    const result = firstValueFrom(service.completeLogin({ code: 'the-code', state: pending.state, error: null, error_description: null }))
      .catch((error: unknown) => error);
    const request = http.expectOne(`${environment.authUrl}/oauth2/token`);
    expect(request.request.body).toContain('code=the-code');
    expect(request.request.body).toContain(`code_verifier=${pending.codeVerifier}`);
    request.flush(tokens);
    return result;
  }

  it('exchanges the code, stores the session and emits the return URL', async () => {
    const before = Date.now();
    const result = await completeWith({ access_token: 'access', token_type: 'Bearer', expires_in: 900, id_token: idToken() });

    expect(result).toBe('/accounts');
    expect(service.session()?.accessToken).toBe('access');
    expect(service.session()!.expiresAt).toBeGreaterThanOrEqual(before + 900_000);
    expect(JSON.parse(sessionStorage.getItem(SESSION_KEY)!).accessToken).toBe('access');
    expect(sessionStorage.getItem(PENDING_LOGIN_KEY)).toBeNull();
  });

  it('takes the expiry from the access token exp claim when expires_in is missing', async () => {
    const exp = Math.floor(Date.now() / 1000) + 600;
    await completeWith({ access_token: fakeJwt({ exp }), token_type: 'Bearer', id_token: idToken() });

    expect(service.session()?.expiresAt).toBe(exp * 1000);
  });

  it('rejects a token response that does not say when the access token expires', async () => {
    const error = await completeWith({ access_token: 'opaque', token_type: 'Bearer', id_token: idToken() });

    expect(error).toEqual(jasmine.any(OAuthError));
    expect((error as OAuthError).code).toBe('invalid_token_response');
    expect(service.session()).toBeNull();
  });

  it('accepts an ID token issuer that differs only by a trailing slash', async () => {
    const result = await completeWith({ access_token: 'access', token_type: 'Bearer', expires_in: 900, id_token: idToken({ iss: `${environment.authUrl}/` }) });

    expect(result).toBe('/accounts');
  });

  it('rejects an ID token from another issuer', async () => {
    const error = await completeWith({ access_token: 'access', token_type: 'Bearer', expires_in: 900, id_token: idToken({ iss: 'https://evil.example.com' }) });

    expect((error as OAuthError).code).toBe('invalid_id_token');
    expect(service.session()).toBeNull();
  });

  it('remembers the return URL of the pending login until it completes', () => {
    expect(service.pendingReturnUrl()).toBe('/accounts');
    sessionStorage.removeItem(PENDING_LOGIN_KEY);
    expect(service.pendingReturnUrl()).toBe('/');
  });

});

describe('safeReturnUrl', () => {

  it('keeps in-app paths and rejects anything that could leave the app', () => {
    expect(safeReturnUrl('/accounts?page=2')).toBe('/accounts?page=2');
    expect(safeReturnUrl('https://evil.example.com')).toBe('/');
    expect(safeReturnUrl('//evil.example.com')).toBe('/');
    expect(safeReturnUrl('/\\evil.example.com')).toBe('/');
    expect(safeReturnUrl('/auth/callback')).toBe('/');
    expect(safeReturnUrl(null)).toBe('/');
  });

});

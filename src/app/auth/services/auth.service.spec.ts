import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DefaultUrlSerializer, Router } from '@angular/router';
import { signal } from '@angular/core';
import { firstValueFrom, of, throwError } from 'rxjs';
import { environment } from '@src/environments/environment.local';
import { AuthService } from './auth.service';
import { OAuthService } from './oauth.service';
import { OAuthError, TokenSet } from '@app/auth/interfaces/oauth.interface';

const response = { code: 'the-code', state: 'stale', error: null, error_description: null };

describe('AuthService', () => {

  let session: ReturnType<typeof signal<TokenSet | null>>;
  let oauth: jasmine.SpyObj<OAuthService>;
  let router: { url: string; getCurrentNavigation: jasmine.Spy; serializeUrl: jasmine.Spy; navigate: jasmine.Spy };
  let http: HttpTestingController;
  let service: AuthService;

  beforeEach(() => {
    session = signal<TokenSet | null>(null);
    oauth = jasmine.createSpyObj<OAuthService>('OAuthService', ['completeLogin', 'startLogin', 'clearSession', 'endSessionUrl']);
    (oauth as { session: unknown }).session = session.asReadonly();
    oauth.clearSession.and.callFake(() => session.set(null));
    oauth.startLogin.and.resolveTo();

    const serializer = new DefaultUrlSerializer();
    router = {
      url: '/',
      getCurrentNavigation: jasmine.createSpy('getCurrentNavigation').and.returnValue(null),
      serializeUrl: jasmine.createSpy('serializeUrl').and.callFake((tree) => serializer.serialize(tree)),
      navigate: jasmine.createSpy('navigate').and.resolveTo(true)
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: OAuthService, useValue: oauth },
        { provide: Router, useValue: router }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
  });

  afterEach(() => http.verify());

  describe('completeLogin', () => {

    it('keeps a valid session when the callback is stale and goes back to the app', async () => {
      session.set({ accessToken: 'current', idToken: null, expiresAt: Date.now() + 60_000 });
      oauth.completeLogin.and.returnValue(throwError(() => new OAuthError('invalid_state', 'stale')));

      expect(await firstValueFrom(service.completeLogin(response))).toBe('/');
      expect(oauth.clearSession).not.toHaveBeenCalled();
      expect(service.token()).toBe('current');
    });

    it('fails without a session to fall back to', async () => {
      oauth.completeLogin.and.returnValue(throwError(() => new OAuthError('invalid_state', 'stale')));

      await expectAsync(firstValueFrom(service.completeLogin(response))).toBeRejectedWith(jasmine.any(OAuthError));
    });

    it('clears the session it created when the user profile cannot be loaded', async () => {
      session.set({ accessToken: 'current', idToken: null, expiresAt: Date.now() + 60_000 });
      oauth.completeLogin.and.callFake(() => {
        session.set({ accessToken: 'new', idToken: null, expiresAt: Date.now() + 60_000 });
        return of('/accounts');
      });

      const result = firstValueFrom(service.completeLogin(response));
      http.expectOne(`${environment.url}/users/me`).flush(null, { status: 500, statusText: 'Server Error' });

      await expectAsync(result).toBeRejected();
      expect(oauth.clearSession).toHaveBeenCalled();
      expect(service.token()).toBeNull();
    });

  });

  describe('restartLogin', () => {

    it('returns to the target of the navigation in flight, not the current URL', () => {
      router.getCurrentNavigation.and.returnValue({ extractedUrl: new DefaultUrlSerializer().parse('/accounts?page=2') });

      service.restartLogin();

      expect(oauth.startLogin).toHaveBeenCalledOnceWith('/accounts?page=2');
    });

    it('returns to the current URL outside a navigation', () => {
      router.url = '/goals';

      service.restartLogin();

      expect(oauth.startLogin).toHaveBeenCalledOnceWith('/goals');
    });

    it('sends the user to the login page when the redirect cannot start, and can try again', async () => {
      router.url = '/goals';
      oauth.startLogin.and.rejectWith(new Error('no WebCrypto'));
      spyOn(console, 'error');

      service.restartLogin();
      await new Promise((resolve) => setTimeout(resolve));

      expect(router.navigate).toHaveBeenCalledOnceWith(['/auth/login'], { queryParams: { returnUrl: '/goals' } });
      service.restartLogin();
      expect(oauth.startLogin).toHaveBeenCalledTimes(2);
    });

  });

});

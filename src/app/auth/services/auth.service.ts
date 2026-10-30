import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from '@src/environments/environment.local';
import { User } from '@app/auth/interfaces/user.interface';
import { AuthorizationResponse } from '@app/auth/interfaces/oauth.interface';
import { OAuthService } from '@app/auth/services/oauth.service';
import { scopesOf } from '@app/auth/utils/jwt';
import { clearHttpCache } from '@app/shared/interceptors/cache.interceptor';

type authStatus = 'checking' | 'authenticated' | 'not-authenticated';

/** Role scopes authco adds to the access token from the user's roles. */
export const FincoRoles = {
  ADMIN: 'finco:admin',
  PREMIUM: 'finco:premium'
} as const;

/**
 * Session of the logged-in user. Tokens come from authco (see OAuthService); the user
 * profile comes from finco (/users/me), roles from the access token `scope` claim.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private router = inject(Router);
  private http = inject(HttpClient);
  private oauth = inject(OAuthService);

  private _checking = signal(true);
  private _user = signal<User | null>(null);

  private redirecting = false;
  // A 401 while completing a login is shown on the callback page: restarting the login
  // there would loop through authco forever (e.g. a misconfigured audience).
  private completingLogin = false;

  readonly user = this._user.asReadonly();
  readonly authStatus = computed<authStatus>(() => {
    if (this._checking()) return 'checking';
    return this._user() ? 'authenticated' : 'not-authenticated';
  });
  readonly token = computed(() => this.oauth.session()?.accessToken ?? null);
  readonly roles = computed(() => {
    const token = this.token();
    return token ? scopesOf(token) : [];
  });

  /** Handles the authco redirect: code exchange, then the user profile. Emits where to go next. */
  completeLogin(response: AuthorizationResponse): Observable<string> {
    // A stale or replayed callback (e.g. the Back button) must not end the session the
    // user already has: only a session created by this call is cleared when it fails.
    const hadValidSession = this.hasValidToken();
    let createdSession = false;
    this.completingLogin = true;
    return this.oauth.completeLogin(response).pipe(
      tap(() => (createdSession = true)),
      switchMap((returnUrl) => this.loadUser().pipe(map(() => returnUrl))),
      catchError((error) => {
        if (hadValidSession && !createdSession) {
          return of('/');
        }
        this.clearSession();
        throw error;
      }),
      finalize(() => (this.completingLogin = false))
    );
  }

  checkStatus(): Observable<boolean> {
    if (!this.hasValidToken()) {
      this.clearSession();
      return of(false);
    }

    if (this._user()) {
      return of(true);
    }

    return this.loadUser().pipe(
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      })
    );
  }

  updateUser(user: User) {
    return this.http.patch<User>(`${environment.url}/users/${user.id}`, {
      name: user.name,
      enable: user.enable,
      defaultCurrency: user.defaultCurrency
    }).pipe(
      tap((updated) => this._user.set(updated))
    );
  }

  /** Clears the local session and ends the authco session (OIDC RP-initiated logout). */
  logout() {
    const idToken = this.oauth.session()?.idToken;
    this.clearSession();

    if (idToken) {
      this.redirecting = true;
      window.location.assign(this.oauth.endSessionUrl(idToken));
      return;
    }
    this.router.navigate(['/auth/login']);
  }

  /** The access token expired or finco rejected it: without refresh tokens, log in again. */
  restartLogin() {
    if (this.redirecting || this.completingLogin) {
      return;
    }
    const returnUrl = this.currentUrl();
    this.clearSession();
    this.redirecting = true;
    this.oauth.startLogin(returnUrl).catch((error: unknown) => {
      // The redirect could not start (e.g. no WebCrypto outside a secure context): retry from the login page.
      this.redirecting = false;
      console.error('Could not start the login', error);
      this.router.navigate(['/auth/login'], { queryParams: returnUrl !== '/' ? { returnUrl } : {} });
    });
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  private loadUser(): Observable<User> {
    return this.http.get<User>(`${environment.url}/users/me`).pipe(
      tap((user) => {
        this._user.set(user);
        this._checking.set(false);
      })
    );
  }

  // During the first navigation (a guard loading /users/me) router.url is still '/':
  // the page the user asked for is the target of the navigation in flight.
  private currentUrl(): string {
    const navigation = this.router.getCurrentNavigation();
    const target = navigation?.finalUrl ?? navigation?.extractedUrl;
    return target ? this.router.serializeUrl(target) : this.router.url;
  }

  private hasValidToken(): boolean {
    const session = this.oauth.session();
    return !!session && Date.now() < session.expiresAt;
  }

  private clearSession() {
    this._checking.set(false);
    this._user.set(null);
    this.oauth.clearSession();
    clearHttpCache();
  }

}

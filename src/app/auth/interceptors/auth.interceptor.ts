import { inject } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '@app/auth/services/auth.service';
import { environment } from '@src/environments/environment.local';

/**
 * Attaches the access token to finco API requests only: never to authco (the code
 * exchange is authenticated by PKCE) nor to third parties such as the exchange-rate API.
 * A 401 from finco means the token expired or was revoked: start a new login.
 */
export function authInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
    if (!req.url.startsWith(`${environment.url}/`)) {
        return next(req);
    }

    const authService = inject(AuthService);
    const token: string | null = authService.token();

    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req).pipe(
        catchError((error: unknown) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                authService.restartLogin();
            }
            return throwError(() => error);
        })
    );
}

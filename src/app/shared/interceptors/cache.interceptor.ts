import { HttpInterceptorFn, HttpRequest, HttpParams, HttpEventType } from '@angular/common/http';
import { of, tap } from 'rxjs';
import { environment } from '@src/environments/environment.local';

const cache = new Map<string, any>();

/** Drops every cached response, e.g. when the session ends (responses are per user). */
export const clearHttpCache = (): void => cache.clear();

const generateCacheKey = (req: HttpRequest<any>): string => {
  const params = new URLSearchParams();
  if (req.params instanceof HttpParams) {
    req.params.keys().sort().forEach(key => {
      params.set(key, req.params.get(key) || '');
    });
  }
  return `${req.method}:${req.urlWithParams.split('?')[0]}?${params.toString()}`;
};

/** Caches finco API GETs only; writes to finco invalidate them. authco and third parties pass through. */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(`${environment.url}/`)) {
    return next(req);
  }

  if (req.method !== 'GET') {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      cache.clear();
    }
    return next(req);
  }

  const cacheKey = generateCacheKey(req);
  const cachedResponse = cache.get(cacheKey);

  if (cachedResponse && !cacheKey.includes('/users/me')) {
    return of(cachedResponse);
  }
  return next(req).pipe(
    tap(event => {
      if (event.type === HttpEventType.Response) {
        cache.set(cacheKey, event);
      }
    })
  );
};

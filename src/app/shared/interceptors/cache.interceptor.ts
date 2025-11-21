import { HttpInterceptorFn, HttpRequest, HttpParams, HttpEventType } from '@angular/common/http';
import { of, tap } from 'rxjs';

const cache = new Map<string, any>();

const generateCacheKey = (req: HttpRequest<any>): string => {
  const params = new URLSearchParams();
  if (req.params instanceof HttpParams) {
    req.params.keys().sort().forEach(key => {
      params.set(key, req.params.get(key) || '');
    });
  }
  return `${req.method}:${req.urlWithParams.split('?')[0]}?${params.toString()}`;
};

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      cache.clear();
    }
    return next(req);
  }

  const cacheKey = generateCacheKey(req);
  const cachedResponse = cache.get(cacheKey);

  if (cachedResponse && !cacheKey.includes('check-status')) {
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

import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '@src/environments/environment.local';
import { cacheInterceptor, clearHttpCache } from './cache.interceptor';

describe('cacheInterceptor', () => {

  const accountsUrl = `${environment.url}/accounts`;
  let client: HttpClient;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([cacheInterceptor])), provideHttpClientTesting()]
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
    clearHttpCache();
  });

  afterEach(() => {
    http.verify();
    clearHttpCache();
  });

  async function getAccounts() {
    const result = firstValueFrom(client.get(accountsUrl));
    http.match(accountsUrl).forEach((request) => request.flush(['account']));
    return result;
  }

  it('keeps finco GET responses cached across authco token requests', async () => {
    await getAccounts();

    client.post(`${environment.authUrl}/oauth2/token`, '').subscribe();
    http.expectOne(`${environment.authUrl}/oauth2/token`).flush({});

    expect(await getAccounts()).toEqual(['account']);
    http.expectNone(accountsUrl);
  });

  it('drops the cache when finco data changes', async () => {
    await getAccounts();

    client.post(accountsUrl, {}).subscribe();
    http.expectOne({ method: 'POST', url: accountsUrl }).flush({});

    const result = firstValueFrom(client.get(accountsUrl));
    http.expectOne({ method: 'GET', url: accountsUrl }).flush(['fresh']);
    expect(await result).toEqual(['fresh']);
  });

  it('never caches third-party APIs', () => {
    const url = `${environment.exchangeApiUrl}usd.json`;
    client.get(url).subscribe();
    http.expectOne(url).flush({});

    client.get(url).subscribe();
    const requests = http.match(url);
    expect(requests.length).toBe(1);
    requests.forEach((request) => request.flush({}));
  });

});

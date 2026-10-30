import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { throwError } from 'rxjs';
import { AuthCallbackComponent } from './auth-callback.component';
import { AuthService } from '@app/auth/services/auth.service';
import { OAuthService } from '@app/auth/services/oauth.service';
import { OAuthError } from '@app/auth/interfaces/oauth.interface';

describe('AuthCallbackComponent', () => {

  let authService: { completeLogin: jasmine.Spy };
  let oauth: jasmine.SpyObj<OAuthService>;
  let router: { navigateByUrl: jasmine.Spy };

  beforeEach(() => {
    authService = {
      completeLogin: jasmine.createSpy('completeLogin').and.returnValue(throwError(() => new OAuthError('invalid_state', 'Stale login')))
    };
    oauth = jasmine.createSpyObj<OAuthService>('OAuthService', ['pendingReturnUrl', 'startLogin']);
    oauth.pendingReturnUrl.and.returnValue('/accounts');
    oauth.startLogin.and.resolveTo();
    router = { navigateByUrl: jasmine.createSpy('navigateByUrl').and.resolveTo(true) };

    TestBed.configureTestingModule({
      imports: [AuthCallbackComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({ code: 'c', state: 's' }) } } },
        { provide: AuthService, useValue: authService },
        { provide: OAuthService, useValue: oauth },
        { provide: Router, useValue: router }
      ]
    });
  });

  function render() {
    const fixture = TestBed.createComponent(AuthCallbackComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('retries the login towards the page the failed login was going to', () => {
    const fixture = render();
    expect(fixture.nativeElement.textContent).toContain('Stale login');

    fixture.componentInstance.retry();

    expect(oauth.startLogin).toHaveBeenCalledOnceWith('/accounts');
  });

  it('tells the user when the retry cannot reach the login page', async () => {
    oauth.startLogin.and.rejectWith(new Error('no WebCrypto'));
    const fixture = render();

    fixture.componentInstance.retry();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Could not reach the login page');
  });

});

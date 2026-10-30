import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthCallbackComponent } from './auth-callback.component';
import { AuthService } from '@app/auth/services/auth.service';
import { OAuthService } from '@app/auth/services/oauth.service';
import { OAuthError } from '@app/auth/interfaces/oauth.interface';
import { TransactionService } from '@app/transaction/services/transaction.service';
import { AccountService } from '@app/account/service/account.service';

describe('AuthCallbackComponent', () => {

  let authService: { completeLogin: jasmine.Spy; user: jasmine.Spy };
  let oauth: jasmine.SpyObj<OAuthService>;
  let router: { navigateByUrl: jasmine.Spy };
  let transactionService: { getLastestTransaction: jasmine.Spy };

  beforeEach(() => {
    authService = {
      completeLogin: jasmine.createSpy('completeLogin').and.returnValue(throwError(() => new OAuthError('invalid_state', 'Stale login'))),
      user: jasmine.createSpy('user').and.returnValue({ defaultCurrency: 'EUR' })
    };
    oauth = jasmine.createSpyObj<OAuthService>('OAuthService', ['pendingReturnUrl', 'startLogin']);
    oauth.pendingReturnUrl.and.returnValue('/accounts');
    oauth.startLogin.and.resolveTo();
    router = { navigateByUrl: jasmine.createSpy('navigateByUrl').and.resolveTo(true) };
    transactionService = { getLastestTransaction: jasmine.createSpy('getLastestTransaction') };

    TestBed.configureTestingModule({
      imports: [AuthCallbackComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({ code: 'c', state: 's' }) } } },
        { provide: AuthService, useValue: authService },
        { provide: OAuthService, useValue: oauth },
        { provide: Router, useValue: router },
        { provide: TransactionService, useValue: transactionService },
        { provide: AccountService, useValue: { getCurrencies: () => of(['EUR', 'USD']) } }
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

  it('resumes the navigation of a returning user', () => {
    authService.completeLogin.and.returnValue(of('/accounts'));

    render();

    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/accounts', { replaceUrl: true });
    expect(transactionService.getLastestTransaction).not.toHaveBeenCalled();
  });

  it('asks a first-time user for the default currency before resuming', () => {
    authService.completeLogin.and.returnValue(of('/accounts'));
    authService.user.and.returnValue({ defaultCurrency: 'USD' });
    transactionService.getLastestTransaction.and.returnValue(of({ content: [] }));

    const fixture = render();

    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Select your default Currency');
  });

});

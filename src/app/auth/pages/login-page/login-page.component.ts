import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OAuthService } from '@app/auth/services/oauth.service';

/**
 * Entry point of the login: authco handles the actual sign-in (federated with Google),
 * so there is no password form and no registration; accounts are created on first login.
 */
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [],
  templateUrl: './login-page.component.html'
})
export default class LoginPageComponent {

  isRedirecting = signal<boolean>(false);

  private oauth = inject(OAuthService);
  private route = inject(ActivatedRoute);

  signIn() {
    if (this.isRedirecting()) return;

    this.isRedirecting.set(true);
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
    this.oauth.startLogin(returnUrl).catch(() => this.isRedirecting.set(false));
  }

}

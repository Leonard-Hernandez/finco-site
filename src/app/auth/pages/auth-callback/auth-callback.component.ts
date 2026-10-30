import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/auth/services/auth.service';
import { OAuthService } from '@app/auth/services/oauth.service';
import { AuthorizationResponse, OAuthError } from '@app/auth/interfaces/oauth.interface';
import { LoadingPageComponent } from '@app/shared/components/loading-page/loading-page.component';

/**
 * redirect_uri of the authco client: exchanges the authorization code, loads the user
 * and resumes the navigation that required the login.
 */
@Component({
  selector: 'app-auth-callback',
  imports: [LoadingPageComponent],
  templateUrl: './auth-callback.component.html'
})
export class AuthCallbackComponent implements OnInit {

  errorMessage = signal<string | null>(null);

  private authService = inject(AuthService);
  private oauth = inject(OAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap;
    const response: AuthorizationResponse = {
      code: query.get('code'),
      state: query.get('state'),
      error: query.get('error'),
      error_description: query.get('error_description')
    };

    this.authService.completeLogin(response).subscribe({
      next: (returnUrl) => this.router.navigateByUrl(returnUrl, { replaceUrl: true }),
      error: (error: unknown) => this.errorMessage.set(error instanceof OAuthError
        ? error.message
        : 'Could not load your Finco account. Please try again.')
    });
  }

  retry() {
    this.errorMessage.set(null);
    this.oauth.startLogin('/');
  }

}

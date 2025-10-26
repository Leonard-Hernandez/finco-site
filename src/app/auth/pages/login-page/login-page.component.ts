import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/auth/services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorModalComponent } from "@app/shared/components/error-modal/error-modal.component";
import { ResponseError } from '@app/shared/interfaces/response-error.interface';
import { FormUtils } from '@app/shared/utils/form-utils';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, ErrorModalComponent],
  templateUrl: './login-page.component.html'
})
export default class LoginPageComponent {

  isSubmited = signal<boolean>(false);

  _hasError = signal(false);
  errorMessage = signal<string>('');
  errorDetails = signal<string>('');

  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  formUtils = FormUtils;

  loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(5)]]
  });

  onSubmit() {
    this.loginForm.markAllAsTouched();

    if(!this.loginForm.valid || this.isSubmited()) return;

    const userLogin = {
      username: this.loginForm.value.username!,
      password: this.loginForm.value.password!
    };
    
    this.isSubmited.set(true);
    this.authService.login(userLogin.username, userLogin.password).subscribe({
      next: (success) => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isSubmited.set(false);
        this._hasError.set(true);
        const errorResponse = error.error as ResponseError;
        this.errorMessage.set(errorResponse.error);
        this.errorDetails.set(errorResponse.message);
        setTimeout(() => {
          this._hasError.set(false);
        }, 3000);
      }
    });
  }
}

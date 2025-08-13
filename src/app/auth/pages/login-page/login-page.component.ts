import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorModalComponent } from "../../../shared/components/error-modal/error-modal.component";

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, ErrorModalComponent],
  templateUrl: './login-page.component.html'
})
export default class LoginPageComponent {

  _hasError = signal(false);

  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  onSubmit() {
    if(!this.validForm()) return;

    const userLogin = {
      username: this.loginForm.value.username!,
      password: this.loginForm.value.password!
    };
    
    this.authService.login(userLogin.username, userLogin.password).subscribe((isAuthenticated) => {
      if(isAuthenticated) {
        this.router.navigate(['/']);
      } else {
        this._hasError.set(true);
        setTimeout(() => {
          this._hasError.set(false);
        }, 3000);
      }
    })
  }

  validForm(): boolean {
    if (!this.loginForm.valid) {
      this._hasError.set(true);
      setTimeout(() => {
        this._hasError.set(false);
      }, 3000);
      return false;
    }
    return true;
  }

}

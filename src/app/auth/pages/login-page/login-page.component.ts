import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'app-login-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login-page.component.html'
})
export default class LoginPageComponent {

  private _hasError = signal(false);

  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  onSubmit() {
    if(!this.validForm()) return;

    const userLogin = {
      username: this.loginForm.value.username!,
      password: this.loginForm.value.password!
    };
    
    console.log(userLogin);

    this.authService.login(userLogin.username, userLogin.password).pipe(
      map((user) => {
        this.router.navigate(['/']);
      }),
      catchError((error) => {
        console.error(error);
        return of(null);
      })
    );
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

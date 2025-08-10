import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login-page.component.html'
})
export default class LoginPageComponent {

  fb = inject(FormBuilder);
  authService = inject(AuthService);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    this.authService.login(this.loginForm.value.username!, this.loginForm.value.password!).subscribe(
      (user) => {
        console.log(user);
      },
      (error) => {
        console.error(error);
      }
    );
  }

}

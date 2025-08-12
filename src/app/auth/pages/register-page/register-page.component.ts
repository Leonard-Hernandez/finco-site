import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserRegister } from '../../interfaces/user-register.interface';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule],
  templateUrl: './register-page.component.html'
})
export class RegisterPageComponent {

  private _hasError = signal<boolean>(false);

  fb = inject(FormBuilder);
  authService = inject(AuthService);

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit() {

    if(!this.validForm()) return;

    const user : UserRegister = {
      name: this.registerForm.value.name!,
      password: this.registerForm.value.password!,
      email: this.registerForm.value.email!
    };


    this.authService.register(user).pipe(
      map((user) => {
        console.log(user);
      }),
      catchError((error) => {
        console.error(error);
        return of(null);
      })
    );
  }

  validForm(): boolean {
    if (!this.registerForm.valid) {
      this._hasError.set(true);
      setTimeout(() => {
        this._hasError.set(false);
      }, 3000);
      return false;
    }
    return true;
  }

}

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserRegister } from '../../interfaces/user-register.interface';
import { Router } from '@angular/router';
import { ErrorModalComponent } from "../../../shared/components/error-modal/error-modal.component";

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, ErrorModalComponent],
  templateUrl: './register-page.component.html'
})
export class RegisterPageComponent {

  _hasError = signal<boolean>(false);

  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router)

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


    this.authService.register(user).subscribe({
      next: (success) => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this._hasError.set(true);
        setTimeout(() => {
          this._hasError.set(false);
        }, 3000);
      }
    });
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

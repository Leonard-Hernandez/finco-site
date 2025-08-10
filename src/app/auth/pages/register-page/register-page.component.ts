import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserRegister } from '../../interfaces/userregister.interface';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule],
  templateUrl: './register-page.component.html'
})
export class RegisterPageComponent {

  fb = inject(FormBuilder);
  authService = inject(AuthService);

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit() {
    this.authService.register(this.registerForm.value as UserRegister).subscribe(
      (user) => {
        console.log(user);
      },
      (error) => {
        console.error(error);
      }
    );
  }

}

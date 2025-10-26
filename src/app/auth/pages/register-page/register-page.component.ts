import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@app/auth/services/auth.service';
import { UserRegister } from '@app/auth/interfaces/user-register.interface';
import { Router } from '@angular/router';
import { AccountService } from '@app/account/service/account.service';
import { FormUtils } from '@app/shared/utils/form-utils';
import { ErrorModalComponent } from "@app/shared/components/error-modal/error-modal.component";
import { ResponseError } from '@app/shared/interfaces/response-error.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, ErrorModalComponent, RouterLink],
  templateUrl: './register-page.component.html'
})
export class RegisterPageComponent implements OnInit {

  isSubmited = signal<boolean>(false);

  currencies = signal<string[]>([]);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');
  errorDetails = signal<string>('');

  authService = inject(AuthService);
  accountService = inject(AccountService);
  router = inject(Router)

  fb = inject(FormBuilder);
  formUtils = FormUtils;

  ngOnInit(): void {
    this.accountService.getCurrencies().subscribe((currencies) => {
      this.currencies.set(currencies);
    })
  }

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(5)]],
    email: ['', [Validators.required, Validators.email]],
    defaultCurrency: ['USD', [Validators.required]]
  });

  onSubmit() {

    this.registerForm.markAllAsTouched();

    if (!this.registerForm.valid || this.isSubmited()) {
      return;
    }

    this.isSubmited.set(true);

    const user: UserRegister = {
      name: this.registerForm.value.name!,
      password: this.registerForm.value.password!,
      email: this.registerForm.value.email!,
      defaultCurrency: this.registerForm.value.defaultCurrency!
    };

    this.authService.register(user).subscribe({
        next: (success) => {
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.hasError.set(true);
          const errorResponse = error.error as ResponseError;
          this.errorMessage.set(errorResponse.error);
          this.errorDetails.set(errorResponse.message);
          setTimeout(() => {
            this.hasError.set(false);
            this.isSubmited.set(false);
          }, 3000);
        }
      });
  }

}

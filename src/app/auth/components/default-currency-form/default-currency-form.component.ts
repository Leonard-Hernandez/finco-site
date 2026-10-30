import { Component, inject, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@app/auth/services/auth.service';
import { AccountService } from '@app/account/service/account.service';
import { ErrorModalComponent } from '@app/shared/components/error-modal/error-modal.component';
import { ResponseError } from '@app/shared/interfaces/response-error.interface';

/** First-login onboarding: the user picks the default currency of the new account. */
@Component({
  selector: 'app-default-currency-form',
  imports: [ReactiveFormsModule, ErrorModalComponent],
  templateUrl: './default-currency-form.component.html'
})
export class DefaultCurrencyFormComponent implements OnInit {

  /** Emits once the default currency is saved. */
  saved = output<void>();

  currencies = signal<string[]>([]);
  isSubmitted = signal<boolean>(false);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');
  errorDetails = signal<string>('');

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private accountService = inject(AccountService);

  updateForm = this.fb.group({
    defaultCurrency: ['USD', [Validators.required]]
  });

  ngOnInit(): void {
    this.accountService.getCurrencies().subscribe((currencies) => this.currencies.set(currencies));
  }

  onSubmit() {
    this.updateForm.markAllAsTouched();

    const user = this.authService.user();
    if (!user || !this.updateForm.valid || this.isSubmitted()) {
      return;
    }

    this.isSubmitted.set(true);

    this.authService.updateUser({ ...user, defaultCurrency: this.updateForm.value.defaultCurrency! }).subscribe({
      next: () => this.saved.emit(),
      error: (error) => {
        const errorResponse = error.error as ResponseError | null;
        this.hasError.set(true);
        this.errorMessage.set(errorResponse?.error ?? 'Could not save your default currency');
        this.errorDetails.set(errorResponse?.message ?? 'Please try again.');
        setTimeout(() => {
          this.hasError.set(false);
          this.isSubmitted.set(false);
        }, 3000);
      }
    });
  }

}

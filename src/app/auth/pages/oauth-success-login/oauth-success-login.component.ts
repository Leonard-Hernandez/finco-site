import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user.interface';
import { TransactionService } from '@src/app/transaction/services/transaction.service';
import { TransactionFilter } from '@src/app/transaction/interface/transaction';
import { LoadingPageComponent } from "@src/app/shared/components/loading-page/loading-page.component";
import { AccountService } from '@src/app/account/service/account.service';
import { ErrorModalComponent } from "@src/app/shared/components/error-modal/error-modal.component";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ResponseError } from '@src/app/shared/interfaces/response-error.interface';

@Component({
  selector: 'app-oauth-success-login',
  imports: [ReactiveFormsModule, LoadingPageComponent, ErrorModalComponent],
  templateUrl: './oauth-success-login.component.html'
})
export class OauthSuccessLoginComponent {

  loading = signal(true);
  isSubmited = signal<boolean>(false);

  currencies = signal<string[]>([]);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');
  errorDetails = signal<string>('');

  private fb = inject(FormBuilder);
  private routeActive = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private user = computed(() => this.authService.user());
  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);

  updateForm = this.fb.group({
    defaultCurrency: ['USD', [Validators.required]]
  });

  token = toSignal(this.routeActive.queryParamMap.pipe(map(params => params.get('token'))));

  verification = effect(() => {
    if (this.token()) {
      this.authService.OauthLogin(this.token()!);
    }

    if (this.user() && this.user()?.defaultCurrency == 'USD') {

      let transaction = this.transactionService.getLastestTransaction({ userId: this.user()!.id } as TransactionFilter).subscribe((data) => { return data.content; });

      if (transaction) {
        this.router.navigate(['/']);
      }

      this.accountService.getCurrencies().subscribe((data) => this.currencies.set(data));

      this.loading.set(false);

    }
  });

  onSubmit() {
  
      this.updateForm.markAllAsTouched();
  
      if (!this.updateForm.valid || this.isSubmited()) {
        return;
      }
  
      this.isSubmited.set(true);
  
      const user: User = {
        id: this.user()!.id,
        email: this.user()!.email,
        name: this.user()!.name,
        registrationDate: this.user()!.registrationDate,
        enabled: this.user()!.enabled,
        defaultCurrency: this.updateForm.value.defaultCurrency!
      };
  
      this.authService.updateUser(user).subscribe({
          next: (success) => {
            this.router.navigate(['/']);
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

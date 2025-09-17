import { Component, effect, inject, Signal, signal } from '@angular/core';
import { AccountService } from '@app/account/service/account.service';
import { Account } from '@app/account/interface/account.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '@app/shared/utils/form-utils';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ResponseError } from '@app/shared/interfaces/response-error.interface';
import { ErrorModalComponent } from "@app/shared/components/error-modal/error-modal.component";

@Component({
  imports: [ErrorModalComponent, ReactiveFormsModule],
  templateUrl: './account-form.component.html'
})
export class AccountFormComponent {
  route = inject(ActivatedRoute);
  router = inject(Router)

  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');
  errorDetails = signal<string>('');

  account = signal<Account | null>(null);

  currencies = signal<string[]>([]);
  accountTypes = signal<string[]>([]);

  accountService = inject(AccountService);

  accountId: Signal<string> = toSignal(this.route.params.pipe(map(({ id }) => id))) || signal('0');

  fb = inject(FormBuilder);
  formUtils = FormUtils;

  accountForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['', [Validators.required]],
    currency: ['', [Validators.required]],
    description: ['', [Validators.maxLength(255)]],
    enable: [false, [Validators.required]],
    default: [false, [Validators.required]],
    withdrawFee: [0, [Validators.min(0)]],
    depositFee: [0, [Validators.min(0)]]
  });

  ngOnInit(): void {
    this.accountService.getCurrencies().subscribe((currencies) => {
      this.currencies.set(currencies);
    })
    this.accountService.getAccountTypes().subscribe((accountTypes) => {
      this.accountTypes.set(accountTypes);
    })

    if (!isNaN(parseInt(this.accountId()))) {
      this.accountService.getAccountById(this.accountId()).subscribe((account) => {
        this.account.set(account);
      })

      console.log(this.account);
    }
  }

  onSubmit(): void {
    this.accountForm.markAllAsTouched();

    if (!this.accountForm.valid) {
      return;
    }

    const accountToPost: Account = {
      name: this.accountForm.value.name!,
      type: this.accountForm.value.type!,
      currency: this.accountForm.value.currency!,
      description: this.accountForm.value.description!,
      withdrawFee: this.accountForm.value.withdrawFee! / 100,
      depositFee: this.accountForm.value.depositFee! / 100,
      balance: 0,
    };

    if (this.account()) {
      const accountUpdate = {
        ...accountToPost,
        id: this.account()!.id,
        enable: this.accountForm.value.enable!,
        isDefault: this.accountForm.value.default!
      }

      this.accountService.updateAccount(accountUpdate).subscribe(
        {
          next: (success) => {
            this.router.navigate(['/accounts/details/' + this.account()!.id]);
          },
          error: (error) => {
            this.hasError.set(true);
            const errorResponse = error.error as ResponseError;
            this.errorMessage.set(errorResponse.error);
            this.errorDetails.set(errorResponse.message);
            setTimeout(() => {
              this.hasError.set(false);
            }, 3000);
          }
        }
      )
    } else {
      this.accountService.createAccount(accountToPost).subscribe(
        {
          next: (success) => {
            this.router.navigate(['/accounts']);
          },
          error: (error) => {
            this.hasError.set(true);
            const errorResponse = error.error as ResponseError;
            this.errorMessage.set(errorResponse.error);
            this.errorDetails.set(errorResponse.message);
            setTimeout(() => {
              this.hasError.set(false);
            }, 3000);
          }
        }
      )
    }
  }

  bindEffect = effect(() => {
    if (!this.account()) {
      return;
    }
    this.accountForm.patchValue(
      {
        name: this.account()!.name,
        type: this.account()!.type,
        currency: this.account()!.currency,
        description: this.account()!.description,
        withdrawFee: this.account()!.withdrawFee! * 100,
        depositFee: this.account()!.depositFee! * 100,
        enable: this.account()!.isEnable,
        default: this.account()!.isDefault
      }
    );
  })


}

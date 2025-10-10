import { Component, computed, effect, inject, Injector, OnInit, signal, Signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, AccountFilter, AccountResponse, TransactionData, TransferData } from '@src/app/account/interface/account.interface';
import { AccountService } from '@src/app/account/service/account.service';
import { FormUtils } from '@src/app/shared/utils/form-utils';
import { TransactionService } from '@src/app/transaction/services/transaction.service';
import { map } from 'rxjs';
import { ErrorModalComponent } from "../../../../shared/components/error-modal/error-modal.component";
import { ResponseError } from '@src/app/shared/interfaces/response-error.interface';

type operationType = 'deposit' | 'withdraw' | 'transfer';

@Component({
  selector: 'app-account-opertion',
  imports: [ReactiveFormsModule, ErrorModalComponent],
  templateUrl: './account-opertion.component.html'
})
export class AccountOpertionComponent {

  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');
  errorDetails = signal<string>('');

  router = inject(Router)
  fb = inject(FormBuilder);
  activatedRoute = inject(ActivatedRoute)
  accountService = inject(AccountService)
  transactionService = inject(TransactionService);
  formUtils = FormUtils;

  injector = inject(Injector);

  accountId: Signal<string> = toSignal(this.activatedRoute.params.pipe(map((params) => params['id'])));
  operation: Signal<string> = toSignal(this.activatedRoute.params.pipe(map((params) => params['operation'])));

  account: Signal<Account> = signal({} as Account);

  toAccountId = signal(0);
  toAccount = signal({} as Account);
  balance = signal(0);
  exchangeRate = signal(0);

  accounts = signal<Account[]>([]);

  transactionForm = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0)]],
    category: ['', []],
    description: ['', [Validators.maxLength(255)]],
    transferAccountId: [0, []],
    exchangeRate: [0],
  });

  categories = toSignal(this.transactionService.getCategoriesByUser().pipe(
    map((response: string[]) => {
      return response;
    })
  ))

  accountResource = rxResource({
    request: () => this.accountId(),
    loader: () => this.accountService.getAccountById(this.accountId()).pipe(
      map((response: Account) => {
        this.account = signal(response);
        return response;
      })
    )
  })


  onSubmit() {

    this.transactionForm.markAllAsTouched;

    if (!this.transactionForm.valid) {
      return;
    }

    const transactionData: TransactionData = {
      amount: this.transactionForm.value.amount!,
    }

    if (this.transactionForm.value.category != null) {
      transactionData.category = this.transactionForm.value.category!;
    }

    if (this.transactionForm.value.description != null) {
      transactionData.description = this.transactionForm.value.description!;
    }

    if (this.operation() == 'deposit') {
      this.accountService.depositAccount(this.account().id!, transactionData).subscribe({
        next: (success) => {
          this.router.navigate([`/accounts/details/${this.account().id}`]);
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
      });
    }

    if (this.operation() == 'withdraw') {
      this.accountService.withdrawAccount(this.account().id!, transactionData).subscribe({
        next: (success) => {
          this.router.navigate([`/accounts/details/${this.account().id}`]);
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
      });
    }

    if (this.operation() == 'transfer') {
      var transferData: TransferData = {
        ... transactionData, 
        transferAccountId: this.transactionForm.value.transferAccountId!
      }

      if (this.transactionForm.value.exchangeRate) {
        transferData.exchangeRate = this.transactionForm.value.exchangeRate!  
      }


      this.accountService.transferAccount(this.account().id!, transferData).subscribe({
        next: (success) => {
          this.router.navigate([`/accounts/details/${this.account().id}`]);
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
      });
    }

  }

  validateEffect = effect(() => {
    if (this.accountResource.error()) {
      this.router.navigate(['/accounts']);
    }
    if (this.operation() !== 'deposit' && this.operation() !== 'withdraw' && this.operation() !== 'transfer') {
      this.router.navigate(['/accounts']);
    }

    this.transactionForm.get('amount')?.valueChanges.subscribe(value => {
      this.balance.set(value ?? 0);
    });

    if (this.operation() === 'transfer') {
      const filter: AccountFilter = {
        pagination: {
          page: 0,
          size: 50,
          sortBy: 'name',
          sortDirection: 'asc',
        }
      }

      this.accountService.getAccounts(filter).subscribe((response: AccountResponse) => {
        if (response.content.length === 0) {
          this.router.navigate(['/accounts/create']);
        }
        this.accounts.set(response.content);
      })

      this.transactionForm.get('transferAccountId')?.valueChanges.subscribe(value => {
        this.toAccountId.set(value ?? 0);
      });

      this.transactionForm.get('exchangeRate')?.valueChanges.subscribe(value => {
        this.exchangeRate.set(value ?? 0);
      });
    }
  })

  transferAccountEffect = effect(() => {
    if (this.toAccountId() !== 0) {
      var toAccount = this.accounts().find(account => account.id == this.toAccountId())
      this.toAccount.set(toAccount ?? {} as Account);
    }
  })

  calculateBalance = computed(() => {

    if (this.operation() === 'deposit') {
      return this.balance() - (this.balance() * (this.account()?.depositFee ?? 0));
    }

    if (this.operation() === 'withdraw') {
      return this.balance() + (this.balance() * (this.account()?.withdrawFee ?? 0));
    }

    if (this.operation() === 'transfer') {
      var resume = this.balance();
      resume = resume - (resume * (this.account()?.withdrawFee ?? 0));
      if (this.exchangeRate() > 0) {
        resume = resume * this.exchangeRate();
      }
      return resume - (resume * (this.toAccount()?.depositFee ?? 0));
    }

    return this.balance();
  })

}

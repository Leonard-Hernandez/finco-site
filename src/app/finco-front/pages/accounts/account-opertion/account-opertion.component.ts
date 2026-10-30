import { Component, computed, effect, inject, Injector, signal, Signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, AccountFilter, AccountResponse, TransactionData, TransferData } from '@src/app/account/interface/account.interface';
import { AccountService } from '@src/app/account/service/account.service';
import { FormUtils } from '@src/app/shared/utils/form-utils';
import { TransactionService } from '@src/app/transaction/services/transaction.service';
import { map } from 'rxjs';
import { ErrorModalComponent } from "@app/shared/components/error-modal/error-modal.component";
import { ConfirmationModalComponent, TransactionSummary } from "@app/shared/components/confirmation-modal/confirmation-modal.component";
import { ResponseError } from '@app/shared/interfaces/response-error.interface';
import { CurrencyPipe, formatCurrency } from '@angular/common';

@Component({
  selector: 'app-account-opertion',
  imports: [ReactiveFormsModule, ErrorModalComponent, ConfirmationModalComponent, CurrencyPipe],
  templateUrl: './account-opertion.component.html'
})
export class AccountOpertionComponent {

  isSubmitting = signal<boolean>(false);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');
  errorDetails = signal<string>('');
  showConfirmation = signal<boolean>(false);
  transactionSummary = signal<TransactionSummary | null>(null);

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
    amount: [null,[Validators.required, Validators.min(0)]],
    category: [null, [Validators.maxLength(100)]],
    description: [null, [Validators.maxLength(500)]],
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

    if (!this.transactionForm.valid || this.isSubmitting()) {
      return;
    }

    const amount = this.transactionForm.value.amount!;
    const category = this.transactionForm.value.category ? String(this.transactionForm.value.category).trim() : undefined;
    const description = this.transactionForm.value.description ? String(this.transactionForm.value.description).trim() : undefined;

    const summary: TransactionSummary = {
      operationType: this.operation() as 'deposit' | 'withdraw' | 'transfer',
      sourceAccountName: this.account().name,
      sourceAccountCurrency: this.account().currency,
      sourceAccountBalance: this.account().balance,
      amount: amount,
      fee: 0,
      finalAmount: this.calculateBalance(),
      category: category,
      description: description,
    };

    if (this.operation() === 'deposit') {
      // Backend: fee = amount * depositFee, added to balance = amount - fee
      summary.fee = amount * (this.account().depositFee ?? 0);
    }

    if (this.operation() === 'withdraw') {
      // Backend: fee = amount * withdrawFee, deducted from balance = amount + fee
      summary.fee = amount * (this.account().withdrawFee ?? 0);
    }

    if (this.operation() === 'transfer') {
      // Backend: source withdraw fee = amount * withdrawFee (deducted from source)
      const withdrawFee = amount * (this.account().withdrawFee ?? 0);
      summary.fee = withdrawFee;
      summary.totalDeducted = amount + withdrawFee;
      summary.targetAccountName = this.toAccount().name;
      summary.targetAccountCurrency = this.toAccount().currency;

      // Backend: destination deposit fee applied to depositAmount
      var depositAmount: number = amount;
      if (this.exchangeRate() > 0) {
        summary.exchangeRate = this.exchangeRate();
        depositAmount = amount * this.exchangeRate();
      }
      summary.targetFee = depositAmount * (this.toAccount().depositFee ?? 0);
    }

    this.transactionSummary.set(summary);
    this.showConfirmation.set(true);
  }

  confirmTransaction() {
    this.isSubmitting.set(true);
    this.showConfirmation.set(false);

    const transactionData: TransactionData = {
      amount: this.transactionForm.value.amount!,
    }

    if (this.transactionForm.value.category != null) {
      transactionData.category = String(this.transactionForm.value.category!).trim();
    }

    if (this.transactionForm.value.description != null) {
      transactionData.description = String(this.transactionForm.value.description!).trim();
    }

    if (this.operation() == 'deposit') {
      this.accountService.depositAccount(this.account().id!, transactionData).subscribe({
        next: (success) => {
          this.router.navigate([`/accounts/details/${this.account().id}`]);
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    }

    if (this.operation() == 'withdraw') {
      this.accountService.withdrawAccount(this.account().id!, transactionData).subscribe({
        next: (success) => {
          this.router.navigate([`/accounts/details/${this.account().id}`]);
        },
        error: (error) => {
          this.handleError(error);
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
          this.handleError(error);
        }
      });
    }
  }

  cancelConfirmation() {
    this.showConfirmation.set(false);
    this.transactionSummary.set(null);
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
      // Backend: balance += amount - (amount * depositFee)
      return this.balance() - (this.balance() * (this.account()?.depositFee ?? 0));
    }

    if (this.operation() === 'withdraw') {
      // Backend: balance -= amount + (amount * withdrawFee)
      return this.balance() + (this.balance() * (this.account()?.withdrawFee ?? 0));
    }

    if (this.operation() === 'transfer') {
      // Backend: recipient gets deposit(depositAmount) where depositAmount = amount * exchangeRate
      // deposit() adds: depositAmount - (depositAmount * depositFee)
      // The source withdrawFee does NOT affect what the recipient receives
      var depositAmount = this.balance();
      if (this.exchangeRate() > 0) {
        depositAmount = depositAmount * this.exchangeRate();
      }
      return depositAmount - (depositAmount * (this.toAccount()?.depositFee ?? 0));
    }

    return this.balance();
  })

  private handleError(error: any): void {
    this.hasError.set(true);
    const errorResponse = error.error as ResponseError;
    this.errorMessage.set(errorResponse.error);
    this.errorDetails.set(errorResponse.message);
    setTimeout(() => {
      this.hasError.set(false);
      this.isSubmitting.set(false);
    }, 3000);
  }

}

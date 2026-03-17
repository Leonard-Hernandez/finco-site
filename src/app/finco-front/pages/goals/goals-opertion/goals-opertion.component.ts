import { Component, effect, inject, Signal, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, AccountFilter, AccountResponse } from '@src/app/account/interface/account.interface';
import { AccountService } from '@src/app/account/service/account.service';
import { Goal, GoalTransactionData } from '@src/app/goal/interface/goal.interface';
import { GoalService } from '@src/app/goal/service/goal.service';
import { ResponseError } from '@src/app/shared/interfaces/response-error.interface';
import { FormUtils } from '@src/app/shared/utils/form-utils';
import { TransactionService } from '@app/transaction/services/transaction.service';
import { map } from 'rxjs';
import { ErrorModalComponent } from "@app/shared/components/error-modal/error-modal.component";
import { ConfirmationModalComponent, TransactionSummary } from "@app/shared/components/confirmation-modal/confirmation-modal.component";

@Component({
  selector: 'app-goals-opertion',
  imports: [ReactiveFormsModule, ErrorModalComponent, ConfirmationModalComponent],
  templateUrl: './goals-opertion.component.html'
})
export class GoalsOpertionComponent {

  isSubmitting = signal<boolean>(false);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');
  errorDetails = signal<string>('');
  showConfirmation = signal<boolean>(false);
  transactionSummary = signal<TransactionSummary | null>(null);

  router = inject(Router)
  fb = inject(FormBuilder);
  activatedRoute = inject(ActivatedRoute)

  goalService = inject(GoalService)
  accountService = inject(AccountService)
  transactionService = inject(TransactionService);

  formUtils = FormUtils;

  goalId: Signal<string> = toSignal(this.activatedRoute.params.pipe(map((params) => params['id'])));
  goal: Signal<Goal> = signal({} as Goal);
  accountId = signal(0);
  operation: Signal<string> = toSignal(this.activatedRoute.params.pipe(map((params) => params['operation'])));
  accounts = signal<Account[]>([]);

  transactionForm = this.fb.group({
    accountId: [null as number | null, [Validators.required, Validators.min(0)]],
    amount: [null, [Validators.required, Validators.min(0)]],
    category: [null, [Validators.maxLength(100)]],
    description: [null, [Validators.maxLength(500)]],
  });

  accountFilter: AccountFilter = {
    pagination: {
      page: 0,
      size: 50,
      sortBy: 'name',
      sortDirection: 'asc',
    }
  }

  categories = toSignal(this.transactionService.getCategoriesByUser().pipe(
    map((response: string[]) => {
      return response;
    })
  ))

  goalResource = rxResource({
    request: () => this.goalId(),
    loader: () => this.goalService.getGoalById(this.goalId()).pipe(
      map((response: Goal) => {
        this.goal = signal(response);
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
    const accountId = this.transactionForm.value.accountId!;
    const category = this.transactionForm.value.category ?? undefined;
    const description = this.transactionForm.value.description ?? undefined;

    const selectedAccount = this.accounts().find(a => a.id == accountId);
    let selectedAccountName = '';
    let selectedAccountCurrency = '';
    let selectedAccountBalance: number | undefined;

    if (selectedAccount) {
      selectedAccountName = selectedAccount.name;
      selectedAccountCurrency = selectedAccount.currency;
      selectedAccountBalance = selectedAccount.balance;
    } else if (this.operation() === 'withdraw' && this.goal().goalAccountBalances) {
      const gab = this.goal().goalAccountBalances!.find(g => g.account.id == accountId);
      if (gab) {
        selectedAccountName = gab.account.name;
        selectedAccountCurrency = gab.account.currency;
        selectedAccountBalance = gab.balance;
      }
    }

    const summary: TransactionSummary = {
      operationType: this.operation() === 'deposit' ? 'deposit_goal' : 'withdraw_goal',
      sourceAccountName: selectedAccountName,
      sourceAccountCurrency: selectedAccountCurrency,
      sourceAccountBalance: selectedAccountBalance,
      amount: amount,
      fee: 0,
      finalAmount: amount,
      category: category,
      description: description,
      goalName: this.goal().name,
    };

    this.transactionSummary.set(summary);
    this.showConfirmation.set(true);
  }

  confirmTransaction() {
    this.isSubmitting.set(true);
    this.showConfirmation.set(false);

    const transactionData: GoalTransactionData = {
      accountId: this.transactionForm.value.accountId!,
      amount: this.transactionForm.value.amount!,
    }

    if (this.transactionForm.value.category != null) {
      transactionData.category = this.transactionForm.value.category!;
    }

    if (this.transactionForm.value.description != null) {
      transactionData.description = this.transactionForm.value.description!;
    }

    if (this.operation() == 'deposit') {
      this.goalService.depositGoal(this.goal().id!, transactionData).subscribe({
        next: (success) => {
          this.router.navigate([`/goals/details/${this.goal().id}`]);
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    }

    if (this.operation() == 'withdraw') {
      this.goalService.withdrawGoal(this.goal().id!, transactionData).subscribe({
        next: (success) => {
          this.router.navigate([`/goals/details/${this.goal().id}`]);
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
    if (this.goalResource.error()) {
      this.router.navigate(['/goals']);
    }
    if (this.operation() !== 'deposit' && this.operation() !== 'withdraw') {
      this.router.navigate(['/goals']);
    }

    if (this.operation() == 'deposit') {
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
    }
  })

  private handleError(error: any) {
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

import { Component, effect, inject, Injector, Signal, signal } from '@angular/core';
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

@Component({
  selector: 'app-goals-opertion',
  imports: [ReactiveFormsModule, ErrorModalComponent],
  templateUrl: './goals-opertion.component.html'
})
export class GoalsOpertionComponent {

  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');
  errorDetails = signal<string>('');

  router = inject(Router)
  fb = inject(FormBuilder);
  activatedRoute = inject(ActivatedRoute)
  goalService = inject(GoalService)
  accountService = inject(AccountService)
  transactionService = inject(TransactionService);
  formUtils = FormUtils;

  injector = inject(Injector);

  goalId: Signal<string> = toSignal(this.activatedRoute.params.pipe(map((params) => params['id'])));
  goal: Signal<Goal> = signal({} as Goal);

  accountId = signal(0);

  operation: Signal<string> = toSignal(this.activatedRoute.params.pipe(map((params) => params['operation'])));
  accounts = signal<Account[]>([]);

  transactionForm = this.fb.group({
    accountId: [0, [Validators.required, Validators.min(0)]],
    amount: [[Validators.required, Validators.min(0)]],
    category: ['', []],
    description: ['', [Validators.maxLength(255)]],
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

    if (!this.transactionForm.valid) {
      return;
    }

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
      this.goalService.withdrawGoal(this.goal().id!, transactionData).subscribe({
        next: (success) => {
          this.router.navigate([`/goals/details/${this.goal().id}`]);
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

}

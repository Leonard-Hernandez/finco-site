import { Component, computed, inject, signal } from '@angular/core';
import { TransactionChartComponent } from "@app/transaction/components/transaction-chart/transaction-chart.component";
import { TransactionRangesButtonsComponent } from "@app/transaction/components/transaction-ranges-buttons/transaction-ranges-buttons.component";
import { TransactionComponent } from "@app/transaction/components/transaction/transaction.component";
import { TransactionService } from '@src/app/transaction/services/transaction.service';
import { Router } from '@angular/router';
import { Transaction, TransactionChartOptions, TransactionFilter, TransactionResponse, TransactionType } from '@src/app/transaction/interface/transaction';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { IncomeExpensePieChartComponent } from '@src/app/transaction/components/income-expense-pie-chart/income-expense-pie-chart.component';
import { Account, AccountFilter, AccountResponse } from '@src/app/account/interface/account.interface';
import { AccountService } from '@src/app/account/service/account.service';
import { Goal, GoalFilter, GoalResponse } from '@src/app/goal/interface/goal.interface';
import { GoalService } from '@src/app/goal/service/goal.service';

@Component({
  selector: 'app-transactions-stats',
  imports: [TransactionChartComponent, TransactionRangesButtonsComponent, TransactionComponent, IncomeExpensePieChartComponent],
  templateUrl: './transactions-stats.component.html'
})
export class TransactionsStatsComponent {

  chart = signal<Boolean>(true);
  goal = signal<Boolean>(false);

  accounts = signal<Account[]>([]);
  goals = signal<Goal[]>([]);

  goalsService = inject(GoalService);
  accountsService = inject(AccountService);
  transactionsService = inject(TransactionService);
  router = inject(Router);

  transactions = signal<Transaction[]>([]);

  transactionFilter = signal<TransactionFilter>({
    pagination: {
      page: 0,
      size: 1000,
      sortBy: 'date',
      sortDirection: 'desc',
    },
  });

  accountFilter = signal<AccountFilter>({
    pagination: {
      page: 0,
      size: 50,
      sortBy: 'name',
      sortDirection: 'asc',
    }
  })

  goalFilter = signal<GoalFilter>({
    pagination: {
      page: 0,
      size: 50,
      sortBy: 'name',
      sortDirection: 'asc',
    }
  })

  transactionChartOptions = computed<TransactionChartOptions>(() => {
    return {
      transactions: this.transactions(),
      splitBy: 'account',
      limitSeries: 5,
      convertToDefaultCurrency: true
    };
  });

  categories = toSignal(this.transactionsService.getCategoriesByUser().pipe(
    map((response: string[]) => {
      return response;
    })
  ))

  transactionsResource = rxResource({
    request: () => this.transactionFilter(),
    loader: () => this.transactionsService.getTransactions(this.transactionFilter()).pipe(
      map((response: TransactionResponse) => {
        this.transactions.set(response.content);
        return response.content;
      })
    )
  });

  accountResource = rxResource({
    request: () => this.accountFilter(),
    loader: () => this.accountsService.getAccounts(this.accountFilter()).pipe(
      map((response: AccountResponse) => {
        this.accounts.set(response.content);
        return response.content;
      })
    )
  });

  goalResource = rxResource({
    request: () => this.goalFilter(),
    loader: () => this.goalsService.getGoals(this.goalFilter()).pipe(
      map((response: GoalResponse) => {
        this.goals.set(response.content);
        return response.content;
      })
    )
  });

  updateTransactionFilter(startDate: Date) {
    this.transactionFilter.update((filter) => ({
      ...filter,
      startDate
    }));
  }

  updateChart() {
    this.chart.update((chart) => !chart);
  }

  updateGoal() {
    this.goal.update((goal) => !goal);
    if (this.goal()) {
      this.transactionFilter.update((filter) => ({
        ...filter,
        onlyGoalTransactions: true,
        onlyAccountTransactions: false,
        transferAccountId: 0
      }));
    } else {
      this.transactionFilter.update((filter) => ({
        ...filter,
        onlyGoalTransactions: false,
        onlyAccountTransactions: true,
        goalId: 0
      }));
    }
  }

  updateAccountId(event: Event) {
    const select = event.target as HTMLSelectElement;
    const accountId = select.value ? parseInt(select.value, 10) : 0;
    this.transactionFilter.update(filter => ({
      ...filter,
      accountId: accountId || undefined
    }));
  }

  updateGoalId(event: Event) {
    const select = event.target as HTMLSelectElement;
    const goalId = select.value ? parseInt(select.value, 10) : 0;
    this.transactionFilter.update(filter => ({
      ...filter,
      goalId: goalId || undefined
    }));
  }

  updateTransferAccountId(event: Event) {
    const select = event.target as HTMLSelectElement;
    const accountId = select.value ? parseInt(select.value, 10) : 0;
    this.transactionFilter.update(filter => ({
      ...filter,
      transferAccountId: accountId || undefined
    }));
  }

  updateCategory(event: Event) {
    const select = event.target as HTMLSelectElement;
    const category = select.value ? select.value : '';

    if (category === '0') {
      this.transactionFilter.update(filter => ({
        ...filter,
        category: undefined
      }));
    } else {
      this.transactionFilter.update(filter => ({
        ...filter,
        category: category || undefined
      }));
    }
  }

  updateOperation(event: Event) {
    const select = event.target as HTMLSelectElement;
    let operation = select.value ? select.value : '';
    if (operation === '0') {
      this.transactionFilter.update(filter => ({
        ...filter,
        type: undefined
      }));
      return;
    }

    if (operation === 'WITHDRAWAL' && this.goal()) {
      operation = 'WITHDRAW_GOAL';
    } else if (operation === 'DEPOSIT' && this.goal()) {
      operation = 'DEPOSIT_GOAL';
    }

    this.transactionFilter.update(filter => ({
      ...filter,
      type: operation as TransactionType
    }));
  }

}

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
import { ToggleSwitchComponent } from "@app/shared/components/toggle-switch/toggle-switch.component";
import { selectInput, SelectInputComponent } from "@app/shared/components/select-input/select-input.component";

@Component({
  selector: 'app-transactions-stats',
  imports: [TransactionChartComponent, TransactionRangesButtonsComponent, TransactionComponent, IncomeExpensePieChartComponent, ToggleSwitchComponent, SelectInputComponent],
  templateUrl: './transactions-stats.component.html'
})
export class TransactionsStatsComponent {

  operations = signal<selectInput[]>([
    { value: 'DEPOSIT', label: 'Deposit' },
    { value: 'WITHDRAW', label: 'Withdraw' },
  ]);

  chart = signal<boolean>(true);
  goal = signal<boolean>(false);

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
      return response.map((category) => ({
        value: category,
        label: category
      }));
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

  accounts = toSignal(this.accountsService.getAccounts(this.accountFilter()).pipe(
    map((response: AccountResponse) => {
      return response.content.map((account) => ({
        value: account.id?.toString() || '',
        label: account.name
      }));
    })
  ));

  goals = toSignal(this.goalsService.getGoals(this.goalFilter()).pipe(
    map((response: GoalResponse) => {
      return response.content.map((goal) => ({
        value: goal.id?.toString() || '',
        label: goal.name
      }));
      })
    )
  );

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

  updateAccountId(value: string) {
    const accountId = value ? parseInt(value, 10) : 0;
    this.transactionFilter.update(filter => ({
      ...filter,
      accountId: accountId || undefined
    }));
  }

  updateGoalId(value: string) {
    const goalId = value ? parseInt(value, 10) : 0;
    this.transactionFilter.update(filter => ({
      ...filter,
      goalId: goalId || undefined
    }));
  }

  updateTransferAccountId(value: string) {
    const accountId = value ? parseInt(value, 10) : 0;
    this.transactionFilter.update(filter => ({
      ...filter,
      transferAccountId: accountId || undefined
    }));
  }

  updateCategory(value: string) {
    const category = value ? value : '';

    if (category === '') {
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

  updateOperation(value: string) {
    let operation = value ? value : '';
    if (operation === '') {
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

import { Component, computed, effect, inject, signal } from '@angular/core';
import { TransactionService } from '../../../transaction/services/transaction.service';
import { TransactionChartOptions, TransactionFilter, TransactionResponse } from '../../../transaction/interface/transaction';
import { TotalComponent } from "../../../shared/components/total/total.component";
import { AuthService } from '../../../auth/services/auth.service';
import { AccountService } from '../../../account/service/account.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Total } from '../../../account/interface/account.interface';
import { TransactionChartComponent } from "../../../transaction/components/transaction-chart/transaction-chart.component";
import { map } from 'rxjs';
import { TransactionRangesButtonsComponent } from '../../../transaction/components/transaction-ranges-buttons/transaction-ranges-buttons.component';
import { IncomeExpensePieChartComponent } from "../../../transaction/components/income-expense-pie-chart/income-expense-pie-chart.component";

@Component({
  imports: [TotalComponent, TransactionChartComponent, TransactionRangesButtonsComponent, IncomeExpensePieChartComponent],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent {

  name = inject(AuthService).user()?.name;
  accountService = inject(AccountService);
  transactionsService = inject(TransactionService);
  totalTransactions = signal<number>(0);

  filter = signal<TransactionFilter>({
    pagination: {
      page: 0,
      size: 10,
      sortBy: 'date',
      sortDirection: 'asc',
    }
  });

  totals = rxResource<Total[], Error>({
    loader: () => {
      return this.accountService.getTotals();
    },
  });

  transactions = rxResource({
    request: () => this.filter(),
    loader: () => this.transactionsService.getTransactions(this.filter()).pipe(
      map((response: TransactionResponse) => {
        this.totalTransactions.set(response.page.totalElements);
        return response.content;
      })
    )
  });

  transactionChartOptions = computed<TransactionChartOptions>(() => {
    return {
      transactions: this.transactions.value()!,
      splitBy: 'currency',
      limitSeries: 5
    };
  });

  donuntEffect = effect(() => {
    if (this.totals.value() === undefined) {
      return;
    }
  });

  updateFilter(transactions: number) {
    this.filter.set({
      pagination: {
        page: 0,
        size: transactions,
        sortBy: 'date',
        sortDirection: 'desc',
      }
    });
  }
}

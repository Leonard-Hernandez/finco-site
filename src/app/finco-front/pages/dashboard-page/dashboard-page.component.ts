import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { Total } from '../../../account/interface/account.interface';
import { AccountService } from '../../../account/service/account.service';
import { AuthService } from '../../../auth/services/auth.service';
import { TotalComponent } from "../../../shared/components/total/total.component";
import { IncomeExpensePieChartComponent } from "../../../transaction/components/income-expense-pie-chart/income-expense-pie-chart.component";
import { TransactionChartComponent } from "../../../transaction/components/transaction-chart/transaction-chart.component";
import { TransactionRangesButtonsComponent } from '../../../transaction/components/transaction-ranges-buttons/transaction-ranges-buttons.component';
import { TransactionChartOptions, TransactionFilter, TransactionResponse } from '../../../transaction/interface/transaction';
import { TransactionService } from '../../../transaction/services/transaction.service';

@Component({
  imports: [TotalComponent, TransactionChartComponent, TransactionRangesButtonsComponent, IncomeExpensePieChartComponent],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent {

  name = inject(AuthService).user()?.name;
  accountService = inject(AccountService);
  transactionsService = inject(TransactionService);
  router = inject(Router);

  filter = signal<TransactionFilter>({
    pagination: {
      page: 0,
      size: 10,
      sortBy: 'date',
      sortDirection: 'desc',
    },
    onlyAccountTransactions: true,
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
        return response.content;
      })
    )
  });

  transactionChartOptions = computed<TransactionChartOptions>(() => {
    return {
      transactions: this.transactions.value()!,
      splitBy: 'defaultCurrency',
      limitSeries: 5,
      convertToDefaultCurrency: true
    };
  });

  updateFilter(startDate: Date) {
    this.filter.set({
      pagination: {
        page: 0,
        size: 500,
        sortBy: 'date',
        sortDirection: 'desc',
      },
      onlyAccountTransactions: true,
      startDate: startDate,
    });
  }
}

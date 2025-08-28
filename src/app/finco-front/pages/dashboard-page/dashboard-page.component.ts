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
import { ExchangeRateService } from '../../../shared/services/exchange-rate.service';
import { Router } from '@angular/router';

@Component({
  imports: [TotalComponent, TransactionChartComponent, TransactionRangesButtonsComponent, IncomeExpensePieChartComponent],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent {

  name = inject(AuthService).user()?.name;
  accountService = inject(AccountService);
  transactionsService = inject(TransactionService);
  exchangeService = inject(ExchangeRateService);
  router = inject(Router);
  totalTransactions = signal<number>(0);

  filter = signal<TransactionFilter>({
    pagination: {
      page: 0,
      size: 10,
      sortBy: 'date',
      sortDirection: 'asc',
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
        return response.content.map((transaction) => {
          transaction.amount = this.exchangeService.convert(transaction.account.currency, transaction.amount);
          return transaction;
        });
      })
    )
  });

  transactionChartOptions = computed<TransactionChartOptions>(() => {
    return {
      transactions: this.transactions.value()!,
      splitBy: 'defaultCurrency',
      limitSeries: 5
    };
  });

  donuntEffect = effect(() => {
    if (this.totals.value() === undefined) {
      return;
    }
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

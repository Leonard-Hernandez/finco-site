import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { map, of } from 'rxjs';
import { AccountService } from '@app/account/service/account.service';
import { AuthService } from '@app/auth/services/auth.service';
import { TotalComponent } from "@app/shared/components/total/total.component";
import { IncomeExpensePieChartComponent } from "@app/transaction/components/income-expense-pie-chart/income-expense-pie-chart.component";
import { TransactionChartComponent } from "@app/transaction/components/transaction-chart/transaction-chart.component";
import { TransactionRangesButtonsComponent } from "@app/transaction/components/transaction-ranges-buttons/transaction-ranges-buttons.component";
import { TransactionChartOptions, TransactionFilter, TransactionResponse } from '@app/transaction/interface/transaction';
import { TransactionService } from '@app/transaction/services/transaction.service';
import { LoadingPageComponent } from "@app/shared/components/loading-page/loading-page.component";

@Component({
  imports: [TotalComponent, TransactionChartComponent, TransactionRangesButtonsComponent, IncomeExpensePieChartComponent, LoadingPageComponent],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent {

  loading = signal<boolean>(true);

  name = inject(AuthService).user()?.name;

  accountService = inject(AccountService);
  transactionsService = inject(TransactionService);
  router = inject(Router);

  filter = signal<TransactionFilter>({
    pagination: {
      page: 0,
      size: 1000,
      sortBy: 'date',
      sortDirection: 'desc',
    },
    onlyAccountTransactions: true,
  });

  lastTransaction = toSignal(this.transactionsService.getLastestTransaction(this.filter()).pipe(
    map((response: TransactionResponse) => {
      return response.content[0]
    })
  ), { initialValue: null })

  totals = toSignal(this.accountService.getTotals());

  transactions = rxResource({
    request: () => this.filter(),
    loader: ({ request: filter }) => {
      if (!filter.startDate) { return of([]); }
      return this.transactionsService.getTransactions(filter).pipe(
        map((response: TransactionResponse) => {
          return response.content;
        })
      );
    }
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
    this.filter.update((filter) => ({ ...filter, startDate: startDate }));
  }

  redirectEffect = effect(() => {
    const transaction = this.lastTransaction();
    if (transaction === null) return;

    if (transaction === undefined) {
      this.router.navigate(['/accounts']);
      return;
    }

    this.loading.set(false);
  })

}

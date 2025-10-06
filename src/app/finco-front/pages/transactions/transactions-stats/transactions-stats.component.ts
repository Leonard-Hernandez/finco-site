import { Component, computed, inject, signal } from '@angular/core';
import { TransactionChartComponent } from "../../../../transaction/components/transaction-chart/transaction-chart.component";
import { TransactionRangesButtonsComponent } from "../../../../transaction/components/transaction-ranges-buttons/transaction-ranges-buttons.component";
import { TransactionComponent } from "../../../../transaction/components/transaction/transaction.component";
import { TransactionService } from '@src/app/transaction/services/transaction.service';
import { Router } from '@angular/router';
import { Transaction, TransactionChartOptions, TransactionFilter, TransactionResponse } from '@src/app/transaction/interface/transaction';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-transactions-stats',
  imports: [TransactionChartComponent, TransactionRangesButtonsComponent, TransactionComponent],
  templateUrl: './transactions-stats.component.html'
})
export class TransactionsStatsComponent {

  transactionsService = inject(TransactionService);
  router = inject(Router);

  transactions = signal<Transaction[]>([]);

  transactionFilter = signal<TransactionFilter>({
    pagination: {
      page: 0,
      size: 10,
      sortBy: 'date',
      sortDirection: 'desc',
    },
    onlyGoalTransactions: true
  });

  transactionChartOptions = computed<TransactionChartOptions>(() => {
    return {
      transactions: this.transactions(),
      splitBy: 'account',
      limitSeries: 5,
      convertToDefaultCurrency: true
    };
  });

  transactionsResource = rxResource({
    request: () => this.transactionFilter(),
    loader: () => this.transactionsService.getTransactions(this.transactionFilter()).pipe(
      map((response: TransactionResponse) => {
        this.transactions.set(response.content);
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
}

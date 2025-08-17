import { Component, computed, inject, signal } from '@angular/core';
import { TransactionService } from '../../../transaction/services/transaction.service';
import { Transaction, TransactionChartOptions, TransactionFilter, TransactionResponse } from '../../../transaction/interface/transaction';
import { TotalComponent } from "../../../shared/components/total/total.component";
import { AuthService } from '../../../auth/services/auth.service';
import { AccountService } from '../../../account/service/account.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Total } from '../../../account/interface/account.interface';
import { TransactionChartComponent } from "../../../transaction/components/transaction-chart/transaction-chart.component";
import { firstValueFrom, map } from 'rxjs';

@Component({
  imports: [TotalComponent, TransactionChartComponent],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent {

  name = inject(AuthService).user()?.name;

  filter = signal<TransactionFilter>({
    pagination: {
      page: 0,
      size: 10,
      sortBy: 'date',
      sortDirection: 'asc',
    }
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
      splitBy: 'currency',
      limitSeries: 3
    };
  });

  accountService = inject(AccountService);
  transactionsService = inject(TransactionService);

  totals = rxResource<Total[], Error>({
    loader: () => {
      return this.accountService.getTotals();
    },
  });
}

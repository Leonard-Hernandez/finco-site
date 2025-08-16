import { Component, inject } from '@angular/core';
import { TransactionService } from '../../../transaction/services/transaction.service';
import { Transaction, TransactionFilter, TransactionResponse } from '../../../transaction/interface/transaction';
import { TotalComponent } from "../../../shared/components/total/total.component";
import { AuthService } from '../../../auth/services/auth.service';
import { AccountService } from '../../../account/service/account.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Total } from '../../../account/interface/account.interface';
import { TransactionChartComponent } from "../../../transaction/components/transaction-chart/transaction-chart.component";

@Component({
  imports: [TotalComponent, TransactionChartComponent],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent {

  name = inject(AuthService).user()?.name;

  accountService = inject(AccountService);
  transactionsService = inject(TransactionService);

  totals = rxResource<Total[], Error>({
    loader: () => {
      return this.accountService.getTotals();
    },
  });

  transactions = rxResource<TransactionResponse, Error>({
    loader: () => {
      const filter: TransactionFilter = {
        pagination: {
          page: 0,
          size: 10,
          sortBy: 'date',
          sortDirection: 'asc',
        }
      };
      return this.transactionsService.getTransactions(filter);
    },
  });

  getTransactions() {
    const filter: TransactionFilter = {
      pagination: {
        page: 0,
        size: 10,
        sortBy: 'id',
        sortDirection: 'desc'
      }
    };
    this.transactionsService.getTransactions(filter).subscribe((res) => {
      console.log(res);
    });
  }
}

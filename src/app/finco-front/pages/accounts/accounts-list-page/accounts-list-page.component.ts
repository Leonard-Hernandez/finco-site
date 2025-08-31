import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { AccountComponent } from "../../../../account/components/account/account.component";
import { AccountFilter, AccountResponse } from '../../../../account/interface/account.interface';
import { AccountService } from '../../../../account/service/account.service';
import { TransactionChartComponent } from '../../../../transaction/components/transaction-chart/transaction-chart.component';
import { TransactionRangesButtonsComponent } from '../../../../transaction/components/transaction-ranges-buttons/transaction-ranges-buttons.component';
import { TransactionChartOptions, TransactionFilter, TransactionResponse } from '../../../../transaction/interface/transaction';
import { TransactionService } from '../../../../transaction/services/transaction.service';

@Component({
  selector: 'app-accounts-list-page',
  imports: [TransactionChartComponent, TransactionRangesButtonsComponent, AccountComponent, CurrencyPipe, DatePipe],
  templateUrl: './accounts-list-page.component.html'
})
export class AccountsListPageComponent {

  accountService = inject(AccountService);
  transactionsService = inject(TransactionService);
  router = inject(Router);

  transactionFilter = signal<TransactionFilter>({
    pagination: {
      page: 0,
      size: 10,
      sortBy: 'date',
      sortDirection: 'desc',
    },
    onlyAccountTransactions: true
  });

  accountFilter = signal<AccountFilter>({
    pagination: {
      page: 0,
      size: 10,
      sortBy: 'balance',
      sortDirection: 'desc',
    }
  });

  transactions = rxResource({
    request: () => this.transactionFilter(),
    loader: () => this.transactionsService.getTransactions(this.transactionFilter()).pipe(
      map((response: TransactionResponse) => {
        return response.content;
      })
    )
  });

  accounts = rxResource({
    request: () => this.accountFilter(),
    loader: () => this.accountService.getAccounts(this.accountFilter()).pipe(
      map((response: AccountResponse) => {
        return response.content;
      })
    )
  });

  transactionChartOptions = computed<TransactionChartOptions>(() => {
    return {
      transactions: this.transactions.value()!,
      splitBy: 'account',
      limitSeries: 5,
      convertToDefaultCurrency: true
    };
  });

  updateTransactionFilter(transactions: Date) {
    this.transactionFilter.set({
      pagination: {
        page: 0,
        size: 500,
        sortBy: 'date',
        sortDirection: 'desc',
      },
      startDate: transactions,
      onlyAccountTransactions: true
    });
  }

}

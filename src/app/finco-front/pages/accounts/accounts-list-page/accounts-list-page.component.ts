import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AccountComponent } from "@app/account/components/account/account.component";
import { Account, AccountFilter, AccountResponse } from '@app/account/interface/account.interface';
import { AccountService } from '@app/account/service/account.service';
import { TransactionChartComponent } from '@app/transaction/components/transaction-chart/transaction-chart.component';
import { TransactionRangesButtonsComponent } from '@app/transaction/components/transaction-ranges-buttons/transaction-ranges-buttons.component';
import { TransactionComponent } from "@app/transaction/components/transaction/transaction.component";
import { Transaction, TransactionChartOptions, TransactionFilter, TransactionResponse } from '@app/transaction/interface/transaction';
import { TransactionService } from '@app/transaction/services/transaction.service';

@Component({
  selector: 'app-accounts-list-page',
  imports: [TransactionChartComponent, TransactionRangesButtonsComponent, AccountComponent, TransactionComponent, RouterLink],
  templateUrl: './accounts-list-page.component.html'
})
export class AccountsListPageComponent implements OnInit{

  accountService = inject(AccountService);
  transactionsService = inject(TransactionService);
  router = inject(Router);

  transactions = signal<Transaction[]>([]);
  accounts = signal<Account[]>([]);

  transactionFilter = signal<TransactionFilter>({
    pagination: {
      page: 0,
      size: 1000,
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

  transactionChartOptions = computed<TransactionChartOptions>(() => {
    return {
      transactions: this.transactions(),
      splitBy: 'account',
      limitSeries: 5,
      convertToDefaultCurrency: true
    };
  });

  ngOnInit(): void {

  }

  transactionsResource = rxResource({
    request: () => this.transactionFilter(),
    loader: () => this.transactionsService.getTransactions(this.transactionFilter()).pipe(
      map((response: TransactionResponse) => {
        this.transactions.set(response.content);
        return response.content;
      })
    )
  });

  accountsResource = rxResource({
    request: () => this.accountFilter(),
    loader: () => this.accountService.getAccounts(this.accountFilter()).pipe(
      map((response: AccountResponse) => {
        this.accounts.set(response.content);
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

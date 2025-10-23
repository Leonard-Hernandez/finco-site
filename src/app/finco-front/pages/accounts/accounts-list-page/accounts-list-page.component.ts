import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AccountComponent } from "@app/account/components/account/account.component";
import { AccountFilter, AccountResponse } from '@app/account/interface/account.interface';
import { AccountService } from '@app/account/service/account.service';
import { TransactionChartComponent } from '@app/transaction/components/transaction-chart/transaction-chart.component';
import { TransactionRangesButtonsComponent } from '@app/transaction/components/transaction-ranges-buttons/transaction-ranges-buttons.component';
import { TransactionComponent } from "@app/transaction/components/transaction/transaction.component";
import { Transaction, TransactionChartOptions, TransactionFilter, TransactionResponse } from '@app/transaction/interface/transaction';
import { TransactionService } from '@app/transaction/services/transaction.service';
import { LoadingPageComponent } from "@app/shared/components/loading-page/loading-page.component";

@Component({
  selector: 'app-accounts-list-page',
  imports: [TransactionChartComponent, TransactionRangesButtonsComponent, AccountComponent, TransactionComponent, RouterLink, LoadingPageComponent],
  templateUrl: './accounts-list-page.component.html'
})
export class AccountsListPageComponent {

  loading = signal<boolean>(true);

  accountService = inject(AccountService);
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
    onlyAccountTransactions: true
  });

  lastTransaction = toSignal(this.transactionsService.getLastestTransaction(this.transactionFilter()).pipe(
    map((response: TransactionResponse) => {
      return response.content[0];
    })
  ));

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

  transactionsResource = rxResource({
    request: () => this.transactionFilter(),
    loader: () => this.transactionsService.getTransactions(this.transactionFilter()).pipe(
      map((response: TransactionResponse) => {
        this.transactions.set(response.content);
        return response.content;
      })
    )
  });

  accounts = toSignal(this.accountService.getAccounts(this.accountFilter()).pipe(
    map((response: AccountResponse) => {
      return response.content;
    })
  ));

  updateTransactionFilter(startDate: Date) {
    this.transactionFilter.update((filter) => ({
      ...filter,
      startDate
    }));
  }

  redirectEffect = effect(() => {

    if (this.accounts() == undefined) {
      return
    }

    setTimeout(() => {
      if (this.lastTransaction() === undefined && this.accounts()!.length > 0) {
        this.router.navigateByUrl('accounts/operation/' + this.accounts()![0].id + '/deposit');
        return;
      }
    }, 100);
    
    if (this.accounts()!.length === 0) {
      this.router.navigateByUrl('accounts/create');
      return;
    }

    this.loading.set(false);
  })



}

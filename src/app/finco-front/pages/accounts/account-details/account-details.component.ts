import { Component, computed, effect, inject, signal, Signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccountService } from '@app/account/service/account.service';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Account } from '@app/account/interface/account.interface';
import { CurrencyPipe, PercentPipe } from '@angular/common';
import { TransactionChartComponent } from "@app/transaction/components/transaction-chart/transaction-chart.component";
import { Transaction, TransactionChartOptions, TransactionFilter, TransactionResponse } from '@app/transaction/interface/transaction';
import { TransactionService } from '@app/transaction/services/transaction.service';
import { TransactionRangesButtonsComponent } from "@app/transaction/components/transaction-ranges-buttons/transaction-ranges-buttons.component";
import { TransactionComponent } from "@app/transaction/components/transaction/transaction.component";
import { LoadingPageComponent } from "@app/shared/components/loading-page/loading-page.component";

@Component({
  selector: 'app-account-details',
  imports: [CurrencyPipe, PercentPipe, TransactionChartComponent, TransactionRangesButtonsComponent, TransactionComponent, RouterLink, LoadingPageComponent],
  templateUrl: './account-details.component.html'
})
export class AccountDetailsComponent {

  loading = signal<boolean>(true);

  router = inject(Router)

  account = signal<Account | null>(null);
  transactions = signal<Transaction[]>([]);

  activatedRoute = inject(ActivatedRoute)

  accountService = inject(AccountService)
  transactionService = inject(TransactionService)

  accountId: Signal<string> = toSignal(this.activatedRoute.params.pipe(map(({ id }) => id))) || signal('0');

  transactionFilter = signal<TransactionFilter>({
    pagination: {
      page: 0,
      size: 10,
      sortBy: 'date',
      sortDirection: 'desc',
    },
    accountId: Number(this.accountId()),
  });

  lastTransaction = toSignal(this.transactionService.getLastestTransaction(this.transactionFilter()).pipe(
    map((response: TransactionResponse) => {
      return response.content[0];
    })
  ), { initialValue: null })

  accountResource = rxResource({
    request: () => this.accountId(),
    loader: () => this.accountService.getAccountById(this.accountId()).pipe(
      map((response: Account) => {
        this.account.set(response);
        return response;
      })
    )
  })

  transactionsResource = rxResource({
    request: () => this.transactionFilter(),
    loader: () => this.transactionService.getTransactions(this.transactionFilter()).pipe(
      map((response: TransactionResponse) => {
        this.transactions.set(response.content);
        return response.content;
      })
    )
  })

  transactionChartOptions = computed<TransactionChartOptions>(() => {
    return {
      transactions: this.transactions(),
      splitBy: 'account',
      limitSeries: 5,
      convertToDefaultCurrency: false
    };
  });

  updateTransactionFilter(startDate: Date) {
    this.transactionFilter.update((filter) => ({
      ...filter,
      startDate
    }));
  }

  redirectEffect = effect(() => {
    if (this.account() === null) {
      return;
    }

    if (this.lastTransaction() === null) {
      return;
    }

    if (this.accountResource.error()) {
      this.router.navigate(['/accounts']);
      return;
    }
    
    if (this.lastTransaction() === undefined && this.account() !== undefined) {
      this.router.navigateByUrl("accounts/operation/" + this.account()!.id + "/deposit")
      return;
    }

    this.loading.set(false);

  })

}

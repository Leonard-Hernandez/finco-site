import { Component, computed, effect, inject, signal, Signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccountService } from '@app/account/service/account.service';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Account } from '@app/account/interface/account.interface';
import { CurrencyPipe, NgClass, PercentPipe } from '@angular/common';
import { TransactionChartComponent } from "@src/app/transaction/components/transaction-chart/transaction-chart.component";
import { Transaction, TransactionChartOptions, TransactionFilter, TransactionResponse } from '@src/app/transaction/interface/transaction';
import { TransactionService } from '@src/app/transaction/services/transaction.service';
import { TransactionRangesButtonsComponent } from "@src/app/transaction/components/transaction-ranges-buttons/transaction-ranges-buttons.component";
import { TransactionComponent } from "@src/app/transaction/components/transaction/transaction.component";

@Component({
  selector: 'app-account-details',
  imports: [CurrencyPipe, PercentPipe,  TransactionChartComponent, TransactionRangesButtonsComponent, TransactionComponent, RouterLink],
  templateUrl: './account-details.component.html'
})
export class AccountDetailsComponent {

  router = inject(Router)

  account: Signal<Account> = signal({} as Account);
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

  accountResource = rxResource({
    request: () => this.accountId(),
    loader: () => this.accountService.getAccountById(this.accountId()).pipe(
          map((response: Account) => {
            this.account = signal(response);
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
    this.transactionFilter.set({
      pagination: {
        page: 0,
        size: 500,
        sortBy: 'date',
        sortDirection: 'desc',
      },
      startDate: startDate,
      accountId: Number(this.accountId()),
    });
  }

  validateEffect = effect(() => {
    if (this.accountResource.error()) {
      this.router.navigate(['/accounts']);
    }
  })

}

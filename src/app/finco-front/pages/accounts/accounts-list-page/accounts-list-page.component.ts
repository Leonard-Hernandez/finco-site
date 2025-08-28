import { Component, computed, inject, signal } from '@angular/core';
import { AccountService } from '../../../../account/service/account.service';
import { TransactionService } from '../../../../transaction/services/transaction.service';
import { ExchangeRateService } from '../../../../shared/services/exchange-rate.service';
import { Router } from '@angular/router';
import { TransactionChartOptions, TransactionFilter, TransactionResponse } from '../../../../transaction/interface/transaction';
import { rxResource } from '@angular/core/rxjs-interop';
import { TransactionChartComponent } from '../../../../transaction/components/transaction-chart/transaction-chart.component';
import { TransactionRangesButtonsComponent } from '../../../../transaction/components/transaction-ranges-buttons/transaction-ranges-buttons.component';
import { map } from 'rxjs';

@Component({
  selector: 'app-accounts-list-page',
  imports: [TransactionChartComponent, TransactionRangesButtonsComponent],
  templateUrl: './accounts-list-page.component.html'
})
export class AccountsListPageComponent {

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
    onlyAccountTransactions: true
  });

  transactions = rxResource({
    request: () => this.filter(),
    loader: () => this.transactionsService.getTransactions(this.filter()).pipe(
      map((response: TransactionResponse) => {
        
        this.totalTransactions.set(response.page.totalElements);
        if(this.totalTransactions() === 0){
          this.router.navigate(['/accounts']);
        }
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
      splitBy: 'account',
      limitSeries: 5
    };
  });

  updateFilter(transactions: Date) {
    this.filter.set({
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

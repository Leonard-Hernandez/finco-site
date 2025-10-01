import { Component, computed, effect, inject, signal, Signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Goal } from '@src/app/goal/interface/goal.interface';
import { GoalService } from '@src/app/goal/service/goal.service';
import { Transaction, TransactionChartOptions, TransactionFilter, TransactionResponse } from '@src/app/transaction/interface/transaction';
import { TransactionService } from '@src/app/transaction/services/transaction.service';
import { map } from 'rxjs';
import { TransactionChartComponent } from "@app/transaction/components/transaction-chart/transaction-chart.component";
import { TransactionRangesButtonsComponent } from "@app/transaction/components/transaction-ranges-buttons/transaction-ranges-buttons.component";
import { TransactionComponent } from "@app/transaction/components/transaction/transaction.component";
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ExchangeRateService } from '@src/app/shared/services/exchange-rate.service';

@Component({
  selector: 'app-goals-details',
  standalone: true,
  imports: [
    TransactionChartComponent,
    TransactionRangesButtonsComponent,
    TransactionComponent,
    RouterLink,
    CurrencyPipe,
    DatePipe],
  templateUrl: './goals-details.component.html',
})
export class GoalsDetailsComponent {
  router = inject(Router);
  goal = signal({} as Goal);
  transactions = signal<Transaction[]>([]);
  activatedRoute = inject(ActivatedRoute);
  exchangeService = inject(ExchangeRateService);
  goalService = inject(GoalService);
  transactionService = inject(TransactionService);
  goalId: Signal<string> = toSignal(this.activatedRoute.params.pipe(map(({ id }) => id))) || signal('0');

  resume = computed(() => {
    let resume: Map<string, number> = new Map<string, number>();
    this.goal().goalAccountBalances?.forEach((goalAccountBalance) => {
      if (resume.has(goalAccountBalance.account.currency)) {
        resume.set(goalAccountBalance.account.currency, resume.get(goalAccountBalance.account.currency)! + goalAccountBalance.balance);
      } else {
        resume.set(goalAccountBalance.account.currency, goalAccountBalance.balance);
      }
    }
    )
    return resume;
  })

  total = computed(() => {
    let total = 0

    this.resume().forEach((value, key) => {
      total += this.exchangeService.convert(key, value);
    })

    return total;

  });

  transactionFilter = signal<TransactionFilter>({
    pagination: {
      page: 0,
      size: 10,
      sortBy: 'date',
      sortDirection: 'desc',
    },
    goalId: Number(this.goalId()),
  });

  goalResource = rxResource({
    request: () => this.goalId(),
    loader: () => this.goalService.getGoalById(this.goalId()).pipe(
      map((response: Goal) => {
        this.goal.set(response);
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
      splitBy: 'goal',
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
      accountId: Number(this.goalId()),
    });
  }

  validateEffect = effect(() => {
    if (this.goalResource.error()) {
      this.router.navigate(['/goals']);
    }
  })

}

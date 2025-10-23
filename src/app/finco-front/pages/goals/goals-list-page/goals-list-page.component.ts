import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { GoalFilter, GoalResponse } from '@src/app/goal/interface/goal.interface';
import { GoalService } from '@src/app/goal/service/goal.service';
import { Transaction, TransactionChartOptions, TransactionFilter, TransactionResponse } from '@src/app/transaction/interface/transaction';
import { TransactionService } from '@src/app/transaction/services/transaction.service';
import { map } from 'rxjs';
import { TransactionComponent } from "@app/transaction/components/transaction/transaction.component";
import { TransactionChartComponent } from "@app/transaction/components/transaction-chart/transaction-chart.component";
import { TransactionRangesButtonsComponent } from "@app/transaction/components/transaction-ranges-buttons/transaction-ranges-buttons.component";
import { GoalComponent } from "@app/goal/components/goal/goal.component";
import { RouterLink } from "@angular/router";
import { LoadingPageComponent } from "@app/shared/components/loading-page/loading-page.component";

@Component({
  selector: 'app-goals-list-page',
  imports: [TransactionComponent, TransactionChartComponent, TransactionRangesButtonsComponent, GoalComponent, RouterLink, LoadingPageComponent],
  templateUrl: './goals-list-page.component.html'
})
export class GoalsListPageComponent {

  loading = signal<boolean>(true);

  goalService = inject(GoalService);
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
    onlyGoalTransactions: true
  });

  lastTransaction = toSignal(this.transactionsService.getLastestTransaction(this.transactionFilter()).pipe(
    map((response: TransactionResponse) => {
      return response.content[0];
    })
  ))

  goalFilter = signal<GoalFilter>({
    pagination: {
      page: 0,
      size: 10,
      sortBy: 'id',
      sortDirection: 'desc',
    }
  });

  transactionChartOptions = computed<TransactionChartOptions>(() => {
    return {
      transactions: this.transactions(),
      splitBy: 'goal',
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

  goals = toSignal(this.goalService.getGoals(this.goalFilter()).pipe(
    map((response: GoalResponse) => {
      return response.content;
    })
  )
  );

  updateTransactionFilter(startDate: Date) {
    this.transactionFilter.update((filter) => ({
      ...filter,
      startDate
    }))
  }

  redirectEffect = effect(() => {

    if (this.goals() == undefined) {
      return;
    }

    setTimeout(() => {
      if (this.lastTransaction() === undefined && this.goals()!.length > 0) {
        this.router.navigateByUrl('goals/operation/' + this.goals()![0].id + '/deposit');
        return;
      }
    }, 100);
    if (this.goals()!.length === 0) {
      this.router.navigateByUrl('goals/create');
      return;
    }

    this.loading.set(false);
  })


}

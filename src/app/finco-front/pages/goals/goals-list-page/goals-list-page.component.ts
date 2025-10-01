import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Goal, GoalFilter, GoalResponse } from '@src/app/goal/interface/goal.interface';
import { GoalService } from '@src/app/goal/service/goal.service';
import { Transaction, TransactionChartOptions, TransactionFilter, TransactionResponse } from '@src/app/transaction/interface/transaction';
import { TransactionService } from '@src/app/transaction/services/transaction.service';
import { map } from 'rxjs';
import { TransactionComponent } from "@app/transaction/components/transaction/transaction.component";
import { TransactionChartComponent } from "@app/transaction/components/transaction-chart/transaction-chart.component";
import { TransactionRangesButtonsComponent } from "@app/transaction/components/transaction-ranges-buttons/transaction-ranges-buttons.component";
import { GoalComponent } from "@app/goal/components/goal/goal.component";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-goals-list-page',
  imports: [TransactionComponent, TransactionChartComponent, TransactionRangesButtonsComponent, GoalComponent, RouterLink],
  templateUrl: './goals-list-page.component.html'
})
export class GoalsListPageComponent {

  goalService = inject(GoalService);
  transactionsService = inject(TransactionService);
  router = inject(Router);

  transactions = signal<Transaction[]>([]);
  goals = signal<Goal[]>([]);

  transactionFilter = signal<TransactionFilter>({
    pagination: {
      page: 0,
      size: 10,
      sortBy: 'date',
      sortDirection: 'desc',
    },
    onlyGoalTransactions: true
  });

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

  goalResource = rxResource({
    request: () => this.goalFilter(),
    loader: () => this.goalService.getGoals(this.goalFilter()).pipe(
      map((response: GoalResponse) => {
        this.goals.set(response.content);
        return response.content;
      })
    )
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
      onlyAccountTransactions: true
    });
  }


}

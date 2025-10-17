import { Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
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
      size: 1000,
      sortBy: 'date',
      sortDirection: 'desc',
    },
    onlyGoalTransactions: true
  });

  lastTransaction = toSignal(this.transactionsService.getLastestTransaction(this.transactionFilter()).pipe(
    map((response: TransactionResponse) => {
      if (response && response.content.length > 0) {
        return response.content[0]
      } else {
        if (this.goals() && this.goals().length >0) {
          this.router.navigateByUrl("goals/operation/" + this.goals()[0].id +"/deposit")
        }
        return null;
      }
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

  goalResource = rxResource({
    request: () => this.goalFilter(),
    loader: () => this.goalService.getGoals(this.goalFilter()).pipe(
      map((response: GoalResponse) => {
        if (response.content.length=0) {
          this.router.navigateByUrl("goals/create")
        }
        this.goals.set(response.content);
        return response.content;
      })
    )
  });

  updateTransactionFilter(startDate: Date) {
    this.transactionFilter.update((filter) => ({
      ...filter,
      startDate
    }))
  }


}

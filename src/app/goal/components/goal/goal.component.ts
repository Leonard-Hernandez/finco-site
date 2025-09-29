import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Goal } from '@app/goal/interface/goal.interface';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ExchangeRateService } from '@src/app/shared/services/exchange-rate.service';

@Component({
  selector: 'app-goal',
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './goal.component.html'
})
export class GoalComponent {

  router = inject(Router);

  goal = input.required<Goal>();

  exchageService = inject(ExchangeRateService);

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
      console.log(key, value)
      total += this.exchageService.convert(key, value);
    })

    return total;

  });

}



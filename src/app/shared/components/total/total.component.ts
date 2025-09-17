import { Component, computed, inject, input } from '@angular/core';
import { Total } from '@app/account/interface/account.interface';
import { CurrencyPipe, NgClass } from '@angular/common';
import { ExchangeRateService } from '@app/shared/services/exchange-rate.service';
import { AuthService } from '@app/auth/services/auth.service';

@Component({
  selector: 'app-total',
  imports: [NgClass, CurrencyPipe],
  templateUrl: './total.component.html'
})
export class TotalComponent {

  exchangeService = inject(ExchangeRateService);
  defaultCurrency = inject(AuthService).user()?.defaultCurrency;
  
  _total = input.required<Total[]>();

  total = computed(() => {
    if(this._total() === undefined || this._total().length === 0) {
      return 0;
    }
    let total = 0;
    this._total().forEach((row) => {
      total += this.exchangeService.convert(row.currency, row.total);
    })
    return total;
  });
    

  totals = computed(() => {

    if(this._total() === undefined || this._total().length === 0) {
      return [{total: 0, currency: '***'}];
    }

    return [...this._total()].sort((a, b) => this.exchangeService.convert(b.currency, b.total) - this.exchangeService.convert(a.currency, a.total) ).slice(0, 4);
  }); 

}

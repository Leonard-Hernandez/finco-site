import { Component, computed, input } from '@angular/core';
import { Total } from '../../../account/interface/account.interface';
import { CurrencyPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-total',
  imports: [NgClass, CurrencyPipe],
  templateUrl: './total.component.html'
})
export class TotalComponent {

  _total = input.required<Total[]>();

  total = computed(() => {

    if(this._total() === undefined || this._total().length === 0) {
      return [{total: 0, currency: '***'}];
    }

    return [...this._total()].sort((a, b) => b.total - a.total);
  }); 

}

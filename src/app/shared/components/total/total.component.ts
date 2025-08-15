import { Component, computed, input } from '@angular/core';


export interface Total {
    total: number;
    currency: string;
}

@Component({
  selector: 'app-total',
  imports: [],
  templateUrl: './total.component.html'
})
export class TotalComponent {

  _total = input.required<Total[]>();

  total = computed(() => {
    return [...this._total()].sort((a, b) => b.total - a.total);
  });

}

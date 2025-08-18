import { Component, computed, inject, input, output, signal } from '@angular/core';

@Component({
  selector: 'transaction-ranges-buttons',
  imports: [],
  templateUrl: './transaction-ranges-buttons.component.html'
})
export class TransactionRangesButtonsComponent {

  transactionsTotals = input.required<number>();

  range = output<number>();

  ranges = computed(() => {
    let range = this.transactionsTotals() / 3;
    return [Math.ceil(range * 3), Math.ceil(range * 2), Math.ceil(range)];
  })

  onRangeClick(range: number) {
    this.range.emit(range);
  }

}

import { Component, computed, inject, input, output, signal } from '@angular/core';

interface Range {
  name: string;
  date: Date;
}

@Component({
  selector: 'transaction-ranges-buttons',
  imports: [],
  templateUrl: './transaction-ranges-buttons.component.html'
})
export class TransactionRangesButtonsComponent {

  range = output<Date>();

  ranges = computed(() => {
    return [
      { name: '1 y', date: new Date(new Date().setDate(new Date().getDate() - 365)) },
      { name: '90 d', date: new Date(new Date().setDate(new Date().getDate() - 90)) },
      { name: '30 d', date: new Date(new Date().setDate(new Date().getDate() - 30)) },
      { name: '7 d', date: new Date(new Date().setDate(new Date().getDate() - 7)) },
    ]
  })

  onRangeClick(range: Date) {
    this.range.emit(range);
  }

}

import { Component, computed, input, output } from '@angular/core';
import { Transaction } from '@app/transaction/interface/transaction';

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

  lastTransaction = input<Transaction | null>();

  lastTransactionDate = computed<Date | undefined>(() => {
    const dateString = this.lastTransaction()?.date;
    return dateString ? new Date(dateString) : new Date();
  });

  range = output<Date>();

  ranges = computed(() => {
    return [
      { name: '1 y', date: new Date(new Date().setDate(new Date().getDate() - 365)) },
      { name: '90 d', date: new Date(new Date().setDate(new Date().getDate() - 90)) },
      { name: '30 d', date: new Date(new Date().setDate(new Date().getDate() - 30)) },
      { name: '7 d', date: new Date(new Date().setDate(new Date().getDate() - 7)) },
    ]
  })

  shouldDisable(rangeDate: Date): boolean {
    const lastDate = this.lastTransactionDate();

    return !!lastDate && rangeDate.getTime() > lastDate.getTime();
  }

  onRangeClick(range: Date) {
    this.range.emit(range);
  }

}

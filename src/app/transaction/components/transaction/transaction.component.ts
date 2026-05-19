import { Component, input, signal } from '@angular/core';
import { Transaction } from '@app/transaction/interface/transaction';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-transaction',
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './transaction.component.html'
})
export class TransactionComponent {

  transaction = input.required<Transaction>();
  descriptionExpanded = signal(false);

  toggleDescription(event: Event) {
    event.stopPropagation();
    this.descriptionExpanded.update(v => !v);
  }

  isLongDescription(): boolean {
    const desc = this.transaction().description;
    return !!desc && desc.length > 60;
  }

}

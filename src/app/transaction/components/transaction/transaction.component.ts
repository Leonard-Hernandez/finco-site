import { Component, input } from '@angular/core';
import { Transaction } from '@app/transaction/interface/transaction';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-transaction',
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './transaction.component.html'
})
export class TransactionComponent {

  transaction = input.required<Transaction>();

}

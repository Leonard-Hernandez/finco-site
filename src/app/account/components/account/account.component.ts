import { Component, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass, PercentPipe } from "@angular/common";
import { Account } from '../../interface/account.interface';

@Component({
  selector: 'app-account',
  imports: [NgClass, CurrencyPipe, PercentPipe, DatePipe],
  templateUrl: './account.component.html'
})
export class AccountComponent {

  account = input.required<Account>();

  isBack = signal<boolean>(false);

}

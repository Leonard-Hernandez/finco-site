import { Component, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass, PercentPipe } from "@angular/common";
import { Account } from '../../interface/account.interface';
import { Router } from "@angular/router";

@Component({
  selector: 'app-account',
  imports: [NgClass, CurrencyPipe],
  templateUrl: './account.component.html'
})
export class AccountComponent {

  router = inject(Router);

  account = input.required<Account>();

}

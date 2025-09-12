import { Component, effect, inject, signal, Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '@app/account/service/account.service';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Account } from '@app/account/interface/account.interface';

@Component({
  selector: 'app-account-details',
  imports: [],
  templateUrl: './account-details.component.html'
})
export class AccountDetailsComponent {

  router = inject(Router)

  activatedRoute = inject(ActivatedRoute)

  accountService = inject(AccountService)

  accountId: Signal<string> = toSignal(this.activatedRoute.params.pipe(map(({ id }) => id))) || signal('0');

  account = rxResource({
    request: () => this.accountId(),
    loader: () => this.accountService.getAccountById(this.accountId()).pipe(
          map((response: Account) => {
            return response;
          })
    )
  })

  validateEffect = effect(() => {
    if (this.account.error()) {
      this.router.navigate(['/accounts']);
    }
  })

}

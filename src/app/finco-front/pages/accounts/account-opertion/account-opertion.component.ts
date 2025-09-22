import { Component, effect, inject, Injector, OnInit, signal, Signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, AccountFilter, AccountResponse } from '@src/app/account/interface/account.interface';
import { AccountService } from '@src/app/account/service/account.service';
import { FormUtils } from '@src/app/shared/utils/form-utils';
import { TransactionService } from '@src/app/transaction/services/transaction.service';
import { map, of } from 'rxjs';
import { ErrorModalComponent } from "../../../../shared/components/error-modal/error-modal.component";

type operationType = 'deposit' | 'withdraw' | 'transfer';

@Component({
  selector: 'app-account-opertion',
  imports: [ReactiveFormsModule, ErrorModalComponent],
  templateUrl: './account-opertion.component.html'
})
export class AccountOpertionComponent implements OnInit{

  router = inject(Router)
  fb = inject(FormBuilder);
  activatedRoute = inject(ActivatedRoute)
  accountService = inject(AccountService)
  transactionService = inject(TransactionService);
  formUtils = FormUtils;

  injector = inject(Injector);

  accountId: Signal<string> = toSignal(this.activatedRoute.params.pipe(map((params) => params['id'])));
  operation: Signal<string> = toSignal(this.activatedRoute.params.pipe(map((params) => params['operation'])));

  account: Signal<Account> = signal({} as Account);
  toAccountId: Signal<number | null> = signal(null);
  toAccount: Signal<Account> = signal({} as Account);

  accounts = signal<Account[]>([]);

  transactionForm = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0)]],
    category: ['', []],
    description: ['', [Validators.maxLength(255)]],
    transferAccountId: [0, [Validators.min(1)]],
    exchangeRate: [0],    
  });

  ngOnInit(): void {
    
  }

  categories = toSignal(this.transactionService.GetCategoriesByUser().pipe(
    map((response: string[]) => {
      return response;
    })
  ))

  accountResource = rxResource({
    request: () => this.accountId(),
    loader: () => this.accountService.getAccountById(this.accountId()).pipe(
      map((response: Account) => {
        this.account = signal(response);
        return response;
      })
    )
  })


  onSubmit() {
    
  }

  validateEffect = effect(() => {
    if (this.accountResource.error()) {
      this.router.navigate(['/accounts']);
    }
    if (this.operation() !== 'deposit' && this.operation() !== 'withdraw' && this.operation() !== 'transfer') {
      this.router.navigate(['/accounts']);
    }

    if (this.operation() === 'transfer') {
      const filter: AccountFilter = {
        pagination: {
          page: 0,
          size: 50,
          sortBy: 'name',
          sortDirection: 'asc',
        }
      } 

      this.accountService.getAccounts(filter).subscribe((response: AccountResponse) => {
        if (response.content.length === 0) {
          this.router.navigate(['/accounts/create']);
        }
        this.accounts.set(response.content);
      })
    }
  })

}

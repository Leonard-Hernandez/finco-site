import { computed, inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@src/environments/environment.local';
import { AuthService } from '@app/auth/services/auth.service';
import { Account, AccountFilter, AccountResponse, Total, TransactionData, TransferData } from '@app/account/interface/account.interface';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class AccountService {

    url: string = environment.url

    authService = inject(AuthService);

    userId = computed(() => this.authService.user()?.id);

    http = inject(HttpClient)

    getTotals(): Observable<Total[]> {
        return this.http.get<Total[]>(`${this.url}/users/${this.userId()}/total-balance`);
    }

    getCurrencies(): Observable<string[]> {
        return this.http.get<string[]>(`${this.url}/accounts/currencies`);
    }

    getAccountTypes(): Observable<string[]> {
        return this.http.get<string[]>(`${this.url}/accounts/types`);
    }

    getAccounts(filter: AccountFilter): Observable<AccountResponse> {

        let params = new HttpParams()
            .set('page', filter.pagination.page)
            .set('size', filter.pagination.size)
            .set('sortBy', filter.pagination.sortBy)
            .set('sortDirection', filter.pagination.sortDirection);
        filter.currency ? params = params.set('currency', filter.currency) : null;
        filter.type ? params = params.set('type', filter.type) : null;
        filter.userId ? params = params.set('userId', filter.userId) : null;
        debugger
        return this.http.get<AccountResponse>(`${this.url}/users/${this.userId()}/accounts`, { params });
    }

    getAccountById(id: string): Observable<Account> {
        return this.http.get<Account>(`${this.url}/accounts/${id}`);
    }

    createAccount(account: Account): Observable<Account> {
        return this.http.post<Account>(`${this.url}/users/${this.userId()}/accounts`, account);
    }

    updateAccount(account: Account): Observable<Account> {
        return this.http.put<Account>(`${this.url}/accounts/${account.id}`, account);
    }

    depositAccount(accountId: number, data: TransactionData){
        return this.http.post<Account>(`${this.url}/accounts/${accountId}/deposit`, data);
    }

    withdrawAccount(accountId: number, data: TransactionData){
        return this.http.post<Account>(`${this.url}/accounts/${accountId}/withdraw`, data);
    }

    transferAccount(accountId: number, data: TransferData){
        return this.http.post<Account>(`${this.url}/accounts/${accountId}/transfer`, data);
    }
}
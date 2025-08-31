import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.local';
import { AuthService } from '../../auth/services/auth.service';
import { AccountFilter, AccountResponse, Total } from '../interface/account.interface';
import { Observable, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class AccountService {

    url: string = environment.url

    userId = inject(AuthService).user()?.id;

    http = inject(HttpClient)

    getTotals(): Observable<Total[]> {
        return this.http.get<Total[]>(`${this.url}/users/${this.userId}/total-balance`);
    }

    getCurrencies(): Observable<string[]> {
        return this.http.get<string[]>(`${this.url}/accounts/currencies`);
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

        return this.http.get<AccountResponse>(`${this.url}/users/${this.userId}/accounts`, { params });
    }
    
}
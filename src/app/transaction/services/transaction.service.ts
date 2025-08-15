import { inject, Injectable, Injector } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.local';
import { AuthService } from '../../auth/services/auth.service';
import { Transaction, TransactionFilter, TransactionResponse } from '../interface/transaction';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TransactionService {

    private readonly API_URL = `${environment.url}`;

    private http = inject(HttpClient);
    private userId = inject(AuthService).user()?.id;

    getTransactions(filter: TransactionFilter): Observable<TransactionResponse> {

        const userId = this.userId!;

        let params = new HttpParams()
            .set('page', filter.pagination.page)
            .set('size', filter.pagination.size)
            .set('sortBy', filter.pagination.sortBy)
            .set('sortDirection', filter.pagination.sortDirection);
        filter.accountId ? params = params.set('accountId', filter.accountId) : null;
        filter.goalId ? params = params.set('goalId', filter.goalId) : null;
        filter.transferAccountId ? params = params.set('transferAccountId', filter.transferAccountId) : null;
        filter.category ? params = params.set('category', filter.category) : null;
        filter.type ? params = params.set('type', filter.type) : null;


        return this.http.get<TransactionResponse>(`${this.API_URL}/users/${userId}/transactions`, { params });
    }

    GetCategoriesByUser(): Observable<Transaction> {
        const userId = this.userId!;
        return this.http.get<Transaction>(`${this.API_URL}/transactions/categories/${userId}`);
    }

}
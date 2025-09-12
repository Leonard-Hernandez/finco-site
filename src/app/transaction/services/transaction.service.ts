import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@src/environments/environment.local';
import { AuthService } from '@app/auth/services/auth.service';
import { Transaction, TransactionFilter, TransactionResponse } from '@app/transaction/interface/transaction';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TransactionService {

    private readonly API_URL = `${environment.url}`;

    private http = inject(HttpClient);
    private userId = inject(AuthService).user()?.id;

    getTransactions(filter: TransactionFilter): Observable<TransactionResponse> {

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
        filter.startDate ? params = params.set('startDate', filter.startDate.toISOString().split('T')[0]) : null;
        filter.endDate ? params = params.set('endDate', filter.endDate.toISOString().split('T')[0]) : null;
        filter.onlyAccountTransactions ? params = params.set('onlyAccountTransactions', filter.onlyAccountTransactions) : null;
        filter.onlyGoalTransactions ? params = params.set('onlyGoalTransactions', filter.onlyGoalTransactions) : null;

        return this.http.get<TransactionResponse>(`${this.API_URL}/users/${this.userId}/transactions`, { params });
    }

    GetCategoriesByUser(): Observable<Transaction> {
        return this.http.get<Transaction>(`${this.API_URL}/transactions/categories/${this.userId}`);
    }

}
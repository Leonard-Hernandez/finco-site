import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.local';
import { AuthService } from '../../auth/services/auth.service';
import { Total } from '../interface/account.interface';
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
    
}
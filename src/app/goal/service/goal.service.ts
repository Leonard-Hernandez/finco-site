import { inject, Injectable, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '@app/auth/services/auth.service';
import { Observable } from 'rxjs';
import { Goal, GoalFilter, GoalResponse, GoalTransactionData } from '@app/goal/interface/goal.interface';
import { appConfig } from '@src/app/core/config/app-config';

@Injectable({providedIn: 'root'})
export class GoalService
 {

    url: string = appConfig().apiUrl

    auth = inject(AuthService)

    userId = computed(() => this.auth.user()?.id)

    http = inject(HttpClient)

    getGoals(filter: GoalFilter): Observable<GoalResponse> {

        let params = new HttpParams()
            .set('page', filter.pagination.page)
            .set('size', filter.pagination.size)
            .set('sortBy', filter.pagination.sortBy)
            .set('sortDirection', filter.pagination.sortDirection);
        filter.accountId ? params = params.set('accountId', filter.accountId) : null;
        filter.userId ? params = params.set('userId', filter.userId) : null;

        return this.http.get<GoalResponse>(`${this.url}/users/${this.userId()}/goals`, { params });
    }

    getGoalById(id: string): Observable<Goal> {
        return this.http.get<Goal>(`${this.url}/goals/${id}`);
    }

    createGoal(goal: Goal): Observable<Goal> {
        return this.http.post<Goal>(`${this.url}/users/${this.userId()}/goals`, goal);
    }

    updateGoal(goal: Goal): Observable<Goal> {
        return this.http.put<Goal>(`${this.url}/goals/${goal.id}`, goal);
    }

    depositGoal(goalId: number, data: GoalTransactionData):  Observable<Goal>{
        return this.http.post<Goal>(`${this.url}/goals/${goalId}/deposit`, data);
    }

    withdrawGoal(goalId: number, data: GoalTransactionData):  Observable<Goal>{
        return this.http.post<Goal>(`${this.url}/goals/${goalId}/withdraw`, data);
    }
}
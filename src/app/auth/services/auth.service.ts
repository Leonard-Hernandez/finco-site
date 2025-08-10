import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { AuthResponse } from '../interfaces/authRespones.interfa';
import { catchError, map, switchMap, throwError } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private user: User | null = null;
  private token: string | null = null;
  private roles: string[] = [];

  private apiUrl: string = environment.url;
  private http = inject(HttpClient);
  private router = inject(Router);

  register() {

  }

  login(username: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      switchMap((response: AuthResponse) => this.handleAuthResponse(response)),
      catchError((error) => {
        console.error('failed to login:', error);
        return throwError(() => error);
      })
    );
  }

  private handleAuthResponse(response: AuthResponse) {
    console.log(response);
    const token: string = response.token;
    const payload: TokenPayload = this.getPayload(token);

    return this.http.get<User>(`${this.apiUrl}/users/${payload.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).pipe(
      map((user: User) => {
        this.user = user;
        this.token = token;
        this.roles = payload.authorities;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('roles', JSON.stringify(this.roles));
        console.log(this.roles);
        console.log(this.user);
        console.log(this.token);

        this.router.navigate(['/']);
      }),
      catchError((error) => {
        console.error('failed to get user:', error);
        throw error;
      })
    );
  }

  private getPayload(token: string): TokenPayload {
    return JSON.parse(atob(token.split('.')[1]));
  }
}

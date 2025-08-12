import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { AuthResponse } from '../interfaces/auth-responses.interface';
import { catchError, map, Observable, of } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { Router } from '@angular/router';
import { UserRegister } from '../interfaces/user-register.interface';
import { rxResource } from '@angular/core/rxjs-interop';

type authStatus = 'checking' | 'authenticated' | 'not-authenticated';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _authStatus = signal<authStatus>('checking');
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));
  private _roles = signal<string[] | null>(JSON.parse(localStorage.getItem('roles')!));

  private router = inject(Router);
  private http = inject(HttpClient);

  checkStatusResource = rxResource({
    loader: () => this.checkStatus(),
  });

  authStatus = computed<authStatus>(() => {
    if (this._authStatus() === 'checking') return 'checking';
    if (this._user()) return 'authenticated';
    return 'not-authenticated';
  });

  user = computed(() => this._user());
  token = computed(() => this._token());
  roles = computed(() => this._roles());

  login(username: string, password: string) {
    console.log(username, password);
    return this.http.post(`${environment.url}/auth/login`, { username, password }).pipe(
      map((resp) => {
        console.log(resp);
        //this.handleAuthSuccess(resp);
      }),
      catchError((error) =>  this.handleAuthError(error))
    );
  }

  register(userRegister: UserRegister) {
    return this.http.post(`${environment.url}/users`, userRegister).pipe(
      map((resp) => {
        this.router.navigate(['/auth/login']);
      }),
      catchError((error) =>  this.handleAuthError(error))
    );
  }

  checkStatus(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.logout;
      return of(false);
    }

    return this.http.get<AuthResponse>(`${environment.url}/auth/check-status`).pipe(
      map((resp) => {
        this.handleAuthSuccess(resp);
        return true;
      }),
      catchError((error: any) => this.handleAuthError(error))
    );

  }

  logout() {
    this._authStatus.set('not-authenticated');
    this._user.set(null);
    this._token.set(null);
    this._roles.set(null);
    localStorage.removeItem('roles');
  }

  private handleAuthSuccess({ token, user }: AuthResponse) {
    this._user.set(user);
    this._token.set(token);
    this._roles.set(this.getRoles(token));

    localStorage.setItem('token', token);
  }

  private handleAuthError(error: any) {
    console.log(error);
    this.logout();
    return of(false);
  }

  getRoles(token: string): string[] {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      const authorities = JSON.parse(payload.authorities);

      return authorities.map((auth: { authority: string }) => {
        const role = auth.authority;
        return role.startsWith('ROLE_') ? role.substring(5) : role;
      });
    } catch (error) {
      console.error('Error parsing token roles:', error);
      return [];
    }
  }



}

import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { AuthService } from '@app/auth/services/auth.service';
import { firstValueFrom } from 'rxjs';

export const AuthenticatedGuard: CanMatchFn = async (
    route: Route,
    segments: UrlSegment[]
) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    const isAuthenticated = await firstValueFrom(authService.checkStatus());
    if(isAuthenticated) {
        return true;
    }
    router.navigate(['/auth/login']);
    return false;
}
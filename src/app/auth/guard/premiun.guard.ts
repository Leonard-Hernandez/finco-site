import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "@app/auth/services/auth.service";

@Injectable({ providedIn: 'root' })
export class PremiunGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.hasRole('PREMIUM')) {
      return true;
    }
    this.router.navigate(['/']);
    return false;
  }
}
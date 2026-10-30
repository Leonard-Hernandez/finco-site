import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AuthService, FincoRoles } from "@app/auth/services/auth.service";

@Injectable({ providedIn: 'root' })
export class PremiunGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (this.authService.hasRole(FincoRoles.PREMIUM)) {
      return true;
    }
    return this.router.createUrlTree(['/']);
  }
}

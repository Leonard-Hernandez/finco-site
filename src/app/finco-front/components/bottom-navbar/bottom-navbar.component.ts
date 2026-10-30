import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, FincoRoles } from '@src/app/auth/services/auth.service';

@Component({
  selector: 'bottom-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-navbar.component.html'
})
export class BottomNavbarComponent {

  authService = inject(AuthService);

  isPremium = computed(() => this.authService.hasRole(FincoRoles.PREMIUM));

}

import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '@app/auth/interfaces/user.interface';
import { AuthService } from '@app/auth/services/auth.service';

@Component({
  selector: 'app-finco-header',
  imports: [RouterLink],
  templateUrl: './finco-header.component.html'
})
export class FincoHeaderComponent {

  authService = inject(AuthService)

}

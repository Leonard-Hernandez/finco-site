import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FincoHeaderComponent } from "@app/shared/components/finco-header/finco-header.component";

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, FincoHeaderComponent],
  templateUrl: './auth-layout.component.html'
})
export class AuthLayoutComponent {

}

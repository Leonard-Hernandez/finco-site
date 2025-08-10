import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FincoHeaderComponent } from "../../../shared/components/finco-header/finco-header.component";

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, FincoHeaderComponent],
  templateUrl: './auth-layout.component.html'
})
export class AuthLayoutComponent {

}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FincoHeaderComponent } from "@app/shared/components/finco-header/finco-header.component";
import { BottomNavbarComponent } from "@app/finco-front/components/bottom-navbar/bottom-navbar.component";

@Component({
  selector: 'app-finco-front-layout',
  imports: [RouterOutlet, FincoHeaderComponent, BottomNavbarComponent],
  templateUrl: './finco-front-layout.component.html'
})
export class FincoFrontLayoutComponent {

}

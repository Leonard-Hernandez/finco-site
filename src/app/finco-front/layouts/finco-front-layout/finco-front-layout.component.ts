import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FincoHeaderComponent } from "../../../shared/components/finco-header/finco-header.component";

@Component({
  selector: 'app-finco-front-layout',
  imports: [RouterOutlet, FincoHeaderComponent],
  templateUrl: './finco-front-layout.component.html'
})
export class FincoFrontLayoutComponent {

}

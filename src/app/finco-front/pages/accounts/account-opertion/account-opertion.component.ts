import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-account-opertion',
  imports: [],
  templateUrl: './account-opertion.component.html'
})
export class AccountOpertionComponent {

  
  activatedRoute = inject(ActivatedRoute)

  id = this.activatedRoute.snapshot.params['id'];
  operation = this.activatedRoute.snapshot.params['operation'];

}

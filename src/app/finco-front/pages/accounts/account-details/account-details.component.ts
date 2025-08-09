import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-account-details',
  imports: [],
  templateUrl: './account-details.component.html'
})
export class AccountDetailsComponent {

  activatedRoute = inject(ActivatedRoute)

  id = this.activatedRoute.snapshot.params['id'];

}

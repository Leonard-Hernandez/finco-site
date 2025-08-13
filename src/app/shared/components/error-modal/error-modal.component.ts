import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  standalone: true,
  imports: []
})
export class ErrorModalComponent {
  @Input() _message: string = '';
  @Input() _details: string = '';
  @Input() _signal: boolean = false;
}

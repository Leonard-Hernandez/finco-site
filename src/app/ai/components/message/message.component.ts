import { Component, input } from '@angular/core';
import { Message } from '../../interface/message.interface';

@Component({
  selector: 'app-message',
  imports: [],
  templateUrl: './message.component.html'
})
export class MessageComponent {

  message = input.required<Message>();

}

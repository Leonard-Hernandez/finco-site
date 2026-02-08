import { Component, input } from '@angular/core';
import { Message } from '../../interface/message.interface';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-message',
  imports: [NgClass],
  templateUrl: './message.component.html'
})
export class MessageComponent {

  message = input.required<Message>();

}

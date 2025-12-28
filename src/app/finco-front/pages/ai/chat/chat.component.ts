import { Component, Inject, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '@src/app/ai/service/websocket.service';

@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  templateUrl: './chat.component.html'
})
export class ChatComponent {

  message: string = '';
  websocketService = Inject(WebsocketService);
  
  

  constructor() {
    this.websocketService.connect();
  }

  send() {
    this.websocketService.send();
  }



}

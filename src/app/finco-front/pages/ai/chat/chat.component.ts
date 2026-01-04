import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '@src/app/ai/service/websocket.service';

@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  templateUrl: './chat.component.html'
})
export class ChatComponent {

  fotoBase64: string | null = null;
  extension: string | null = null;
  message: string = '';
  websocketService = inject(WebsocketService);
  
  connect() {
    this.websocketService.connect();
  }
  
  send() {
    this.websocketService.send(this.message, this.fotoBase64, this.extension);
  }

  onFileSelected(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) { return; }

    this.extension = file.name.split('.').pop()?.toLowerCase() || null;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.fotoBase64 = dataUrl.split(',')[1];
    };
    reader.readAsDataURL(file);
  }



}

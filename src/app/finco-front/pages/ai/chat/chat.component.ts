import { AfterViewChecked, AfterViewInit, Component, effect, ElementRef, inject, OnDestroy, OnInit, signal, Signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Message } from '@src/app/ai/interface/message.interface';
import { WebsocketService } from '@src/app/ai/service/websocket.service';
import { MessageComponent } from "@src/app/ai/components/message/message.component";
import { AuthService } from '@src/app/auth/services/auth.service';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, MessageComponent],
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit, OnDestroy {

  @ViewChild('chatContainer') chatContainer!: ElementRef;
  id = 0
  loading = signal(false);
  image: string | null = null;
  imageUrl = signal('');
  extension: string | null = null;
  message: string = '';
  messages = signal([] as Message[]);
  websocketService = inject(WebsocketService);
  user = inject(AuthService).user()?.name

  ngOnInit(): void {
    this.websocketService.connect();
  }

  ngOnDestroy(): void {
    this.websocketService.disconnect();
  }


  send() {
    if(this.loading()) { return; }
    this.websocketService.send(this.message, this.image, this.extension);
    this.messages.update(messages => [...messages, { id: this.id++, content: this.message, role: "user", image: this.imageUrl(), name: this.user } as Message]);
    this.clear()
    this.loading.set(true);
    setTimeout(() => this.scrollToBottom(), 0);
  }

  onFileSelected(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    this.imageUrl.set(URL.createObjectURL(file!));
    if (!file) { return; }

    this.extension = file.name.split('.').pop()?.toLowerCase() || null;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.image = dataUrl.split(',')[1];
    };
    reader.readAsDataURL(file);
  }

  messageEffect = effect(() => {
    if (!this.websocketService.message()) { return; }
    let message = {
      id: this.id++,
      content: this.websocketService.message()!,
      role: 'Ai',
      name: 'Finco Assistant',
      image: null
    } as Message
    this.messages.update(messages => [...messages, message]);
    this.clear()
    this.loading.set(false);
    setTimeout(() => this.scrollToBottom(), 0);
  });

  clear() {
    this.message = '';
    this.imageUrl.set('');
    this.image = null;
  }

  scrollToBottom() {
    const container = this.chatContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }
}

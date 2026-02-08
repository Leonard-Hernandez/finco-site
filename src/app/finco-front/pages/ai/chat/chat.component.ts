import { AfterViewChecked, AfterViewInit, Component, effect, ElementRef, inject, OnDestroy, OnInit, signal, Signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Message } from '@src/app/ai/interface/message.interface';
import { WebsocketService } from '@src/app/ai/service/websocket.service';
import { MessageComponent } from "@src/app/ai/components/message/message.component";
import { AuthService } from '@src/app/auth/services/auth.service';
import { ErrorModalComponent } from '@src/app/shared/components/error-modal/error-modal.component';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, MessageComponent, ErrorModalComponent],
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

  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');
  errorDetails = signal<string>('');

  ngOnInit(): void {
    try {
      this.websocketService.connect();
    } catch (error) {
      this.handleError("Failed to connect to websocket");
    }
  }

  ngOnDestroy(): void {
    this.websocketService.disconnect();
  }

  send() {
    if (this.loading()) { return; }
    try {
      this.websocketService.send(this.message, this.image, this.extension);
    } catch (error) {
      this.handleError("Failed to send message");
    }
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

  errorEffect = effect(() => {
    if (!this.websocketService.error()) { return; }
    this.handleError(this.websocketService.error()!);
    this.loading.set(false);
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

  private handleError(error: string): void {
    console.error(error);
    this.hasError.set(true);
    this.errorMessage.set(error);
    this.errorDetails.set(error);
    setTimeout(() => {
      this.hasError.set(false);
    }, 3000);
  }
}

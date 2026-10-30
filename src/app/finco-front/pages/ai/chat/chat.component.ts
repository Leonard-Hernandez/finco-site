import { Component, effect, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Attachment, Message } from '@src/app/ai/interface/message.interface';
import { AttachmentPayload, WebsocketService } from '@src/app/ai/service/websocket.service';
import { MessageComponent } from "@src/app/ai/components/message/message.component";
import { AuthService } from '@src/app/auth/services/auth.service';
import { ErrorModalComponent } from '@src/app/shared/components/error-modal/error-modal.component';

interface PendingAttachment {
  name: string;
  mimeType: string;
  data: string;
  url: string;
}

@Component({
  selector: 'app-chat',
  imports: [FormsModule, MessageComponent, ErrorModalComponent],
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit, OnDestroy {

  @ViewChild('chatContainer') chatContainer!: ElementRef;
  id = 0
  loading = signal(false);
  attachments = signal<PendingAttachment[]>([]);
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

  private readonly MAX_PAYLOAD_BYTES = 24 * 1024 * 1024;

  send() {
    if (this.loading()) { return; }
    const pending = this.attachments();
    const totalBytes = pending.reduce((sum, a) => sum + a.data.length, 0);
    if (totalBytes > this.MAX_PAYLOAD_BYTES) {
      this.handleError(`Attachments too large (${(totalBytes / 1024 / 1024).toFixed(1)}MB). Max 24MB.`);
      return;
    }
    const payload: AttachmentPayload[] = pending.map(a => ({ data: a.data, mimeType: a.mimeType }));
    const messageAttachments: Attachment[] = pending.map(a => ({ url: a.url, mimeType: a.mimeType, name: a.name }));

    try {
      this.websocketService.send(this.message, payload);
    } catch (error) {
      this.handleError("Failed to send message");
    }
    this.messages.update(messages => [...messages, {
      id: this.id++, content: this.message, role: "user", name: this.user, attachments: messageAttachments
    } as Message]);
    this.clear()
    this.loading.set(true);
    setTimeout(() => this.scrollToBottom(), 0);
  }

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) { return; }

    Array.from(files).forEach(file => {
      const mime = file.type || this.guessMime(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        const previewUrl = mime.startsWith('image/') ? URL.createObjectURL(file) : '';
        this.attachments.update(list => [...list, {
          name: file.name,
          mimeType: mime,
          data: base64,
          url: previewUrl,
        }]);
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeAttachment(index: number) {
    this.attachments.update(list => list.filter((_, i) => i !== index));
  }

  isImage(mime: string): boolean {
    return mime.startsWith('image/');
  }

  private guessMime(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'application/pdf';
    if (ext === 'png') return 'image/png';
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'gif') return 'image/gif';
    if (ext === 'webp') return 'image/webp';
    return 'application/octet-stream';
  }

  messageEffect = effect(() => {
    const body = this.websocketService.message();
    if (!body) { return; }
    const message = {
      id: this.id++,
      content: body,
      role: 'Ai',
      name: 'Finco Assistant',
      attachments: []
    } as Message;
    this.messages.update(messages => [...messages, message]);
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
    this.attachments.set([]);
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

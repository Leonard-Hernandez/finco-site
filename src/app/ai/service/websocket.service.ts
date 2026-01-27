import { computed, inject, Injectable, signal } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, IStompSocket, StompHeaders } from '@stomp/stompjs';
import { AuthService } from '@src/app/auth/services/auth.service';
import { environment } from '@src/environments/environment.local';
import { ResponseError } from '@src/app/shared/interfaces/response-error.interface';

interface AiaskDto {
  prompt: String,
  userId: number,
  image: String | null,
  imageExtension: string | null,
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private readonly wsUrl: string = environment.url + '/ws';
  private client!: Client;
  private _message = signal('');
  private _error = signal('');
  public readonly message = computed(this._message);
  public readonly error = computed(this._error);

  private token = inject(AuthService).token();
  private userId = inject(AuthService).user()?.id;

  connect() {
    this.client = new Client();
    this.client.webSocketFactory = () => {
      const ws = new SockJS(this.wsUrl);
      return ws as IStompSocket;
    };

    this.client.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      this.client.subscribe(`/user/queue/chat`, (message) => {
        this._message.set(message.body);
      });

      this.client.subscribe(`/user/queue/error`, (message: { body: string }) => {
        const error = JSON.parse(message.body) as ResponseError;
        this._error.set(error.message);
      });
    };

    this.client.onDisconnect = (frame) => {
      console.log("status " + this.client.connected)
      console.log("Disconnected: " + frame);
    }

    let header: StompHeaders = {
      Authorization: 'Bearer ' + this.token
    };

    this.client.connectHeaders = header;
    this.client.activate();
  }

  send(message: string, image: string | null, imageExtension: string | null) {
    let AiAsk = {
      prompt: message,
      userId: this.userId,
      image: image,
      imageExtension: 'image/' + imageExtension
    } as AiaskDto

    this.client.publish({
      destination: '/app/chat',
      body: JSON.stringify(AiAsk)
    });
  }

  disconnect() {
    this.client.deactivate();
  }

}
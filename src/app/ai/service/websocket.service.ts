import { inject, Injectable, OnInit } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, IStompSocket, Stomp, StompHeaders } from '@stomp/stompjs';
import { AuthService } from '@src/app/auth/services/auth.service';

interface AiaskDto {
  prompt: String,
  userId: number,
  image: String | null,
  imageExtension: string | null,
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnInit {

  private client!: Client;

  private token = inject(AuthService).token();
  private userId = inject(AuthService).user()?.id;

  ngOnInit(): void {


  }
  connect() {
    this.client = new Client();
    this.client.webSocketFactory = () => {
      const ws = new SockJS('http://localhost:8086/finco-api/v1/ws');
      return ws as IStompSocket;
    };

    this.client.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      this.client.subscribe(`/user/queue/chat`, (message) => {
        console.log(message.headers);
        console.log(message.body);
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

  send(message: string) {
    let AiAsk = {
      prompt: message,
      userId: this.userId,
      image: null,
      imageExtension: null
    } as AiaskDto


    this.client.publish({
      destination: '/app/chat',
      body: JSON.stringify(AiAsk)
    });
  }

}
import { inject, Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Message, Stomp } from '@stomp/stompjs';
import { AuthService } from '@src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  brokerURL: string = "http://localhost:8086/finco-api/v1/ws"
  stompClient: any
  username: String = inject(AuthService).user()!.id + '';

  connect() {
    const token: string | null = inject(AuthService).token();
    let ws = new SockJS(this.brokerURL)
    this.stompClient = Stomp.over(ws)
    console.log("connected to websocket")

    this.stompClient.connect({ "Authorization": "Bearer " + token }, () => {
      this.stompClient.subscribe(`/user/${this.username}/queue/chat`, (message: any) => {
        //the subscribe also triggers a callback which means when a user subscribes to a destination, an event of a message could be returned
        this.onMessageRecived(message.body)

      })

    },
      ///error callback
      (error: Error | any) => {
        console.log(error.message)
      }
    )
  }

  onMessageRecived(message: any) {
    console.log(message)
  }

  send(message: Message): void {
    this.stompClient.send("/app/chat", {}, JSON.stringify(message))

  }
}

import { inject, Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
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
export class WebsocketService {

  brokerURL: string = "http://localhost:8086/finco-api/v1/ws"
  stompClient: any
  authservice = inject(AuthService)
  username: String = this.authservice.user()!.id + ''
  token: string | null = this.authservice.token();

  connect() {
    let ws = new SockJS(this.brokerURL)
    this.stompClient = Stomp.over(ws)
    console.log("connected to websocket")

    this.stompClient.connect({ "Authorization": "Bearer " + this.token }, () => {
      this.stompClient.subscribe(`/user/7/queue/chat`, (message: any) => {
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

  send(message: String): void {
    let AiAsk = {
      prompt: message,
      userId: this.authservice.user()!.id,
      image: null,
      imageExtension: null
    } as AiaskDto

    this.stompClient.send("/app/chat", {}, JSON.stringify(AiAsk))

  }
}

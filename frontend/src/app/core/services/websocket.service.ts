import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private client: Client;

  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  constructor(private authService: AuthService) {
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/chat-websocket',

      connectHeaders: {
        Authorization: `Bearer ${this.authService.getAccessToken()}`
      },

      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => this.connectedSubject.next(true),
      onDisconnect: () => this.connectedSubject.next(false),
      onStompError: () => this.connectedSubject.next(false),
    });

    this.client.activate();
  }

  subscribeToTopic(topic: string, callback: (body: any) => void): () => void {
    console.log('📡 suscribiendo a:', topic);
    if (!this.client.connected) {
      console.warn('WebSocket no conectado, no se puede suscribir a', topic);
      return () => { };
    }

    const sub = this.client.subscribe(topic, (msg: IMessage) => {
      console.log('📨 frame recibido en topic', topic, msg.body);
      callback(JSON.parse(msg.body));
    });
    return () => sub.unsubscribe();
  }

  sendMessage(destination: string, body: any): void {
    console.log('WebSocketService.sendMessage - connected:', this.client.connected);
    console.log('body:', body);
    if (!this.client.connected) {
      console.error('No conectado, no se puede enviar');
      return;
    }
    try {
      this.client.publish({
        destination: `/app${destination}`,
        body: JSON.stringify(body)
      });
      console.log('✅ publish enviado a', `/app${destination}`);
    } catch (e) {
      console.error('❌ error en publish:', e);
    }
  }

  ngOnDestroy(): void {
    this.client.deactivate();
  }
}

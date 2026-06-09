import { Injectable, OnDestroy } from '@angular/core';
import { filter, Subject, take } from 'rxjs';
import { WebSocketService } from '@/core/services/websocket.service';
import { AuthService } from '@/core/services/auth.service';

export interface ChatMessage {
  sender?: string,
  recipient: string;
  content: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
  private messagesSubject = new Subject<ChatMessage>();
  public messages$ = this.messagesSubject.asObservable();

  private unsubscribe?: () => void;

  constructor(private ws: WebSocketService, private authService: AuthService) {
    this.ws.connected$.pipe(
      filter(connected => connected),
      take(1)
    ).subscribe(() => {
      this.unsubscribe = this.ws.subscribeToTopic(
        '/user/queue/messages',
        (msg: ChatMessage) => this.messagesSubject.next(msg)
      );
    });
  }

  sendMessage(content: string, recipient: string, sender?: string): void {
    console.log('ChatService.sendMessage:', { content, recipient, sender });
    this.ws.sendMessage('/chat.sendMessage', {
      content,
      recipient,
      sender,
    });
  }

  joinChat(username: string): void {
    this.ws.sendMessage('/chat.addUser', {
      sender: username,
      content: `${username} join the chat`,
      timestamp: new Date().toISOString()
    });
  }

  getMessages() {
    return this.messages$;
  }
  get connected$() {
    return this.ws.connected$;
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
  }
}

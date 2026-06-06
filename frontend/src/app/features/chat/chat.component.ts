import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService } from './chat.service';
import { ChatMessage } from './chat.service';
import { filter, Subscription, take } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { BackButtonComponent } from "@/shared/back.component";

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, BackButtonComponent],
  template: `
 <div class="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-indigo-100 py-8 px-4">
  <div class="max-w-4xl mx-auto">

    <!-- Header -->
     @if (chatStarted){
        <back-button (click)="closeChat()"></back-button>
     }
    <div class="bg-white rounded-t-2xl shadow-lg px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">💬 Chat en Tiempo Real</h1>
          @if (chatStarted) {
            <p class="text-sm text-gray-500 mt-1">
              Chateando con <span class="font-semibold text-blue-600">{{ recipientUsername }}</span>
            </p>
          }
        </div>
        <div
          class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          [ngClass]="connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
        >
          <span class="w-2 h-2 rounded-full"
            [ngClass]="connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'">
          </span>
          {{ connected ? 'Conectado' : 'Desconectado' }}
        </div>
      </div>
    </div>

    <!-- Pantalla elegir destinatario -->
    @if (!chatStarted) {
      <div class="bg-white border-x border-gray-200 flex flex-col items-center justify-center h-96 gap-4 p-8">
        <h2 class="text-xl font-semibold text-gray-700">¿Con quién quieres chatear?</h2>
        <input
          [(ngModel)]="recipientUsername"
          name="recipient"
          placeholder="Email del destinatario (ej: test2@test.com)"
          class="w-full max-w-sm px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          (keyup.enter)="startChat()"
        />
        <button
          (click)="startChat()"
          [disabled]="!recipientUsername.trim() || !connected"
          class="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl disabled:opacity-50"
        >
          Iniciar chat
        </button>
      </div>
    }

    <!-- Pantalla chat -->
    @if (chatStarted) {
      <!-- Mensajes -->
      <div
        #messagesContainer
        class="bg-white h-96 overflow-y-auto px-6 py-4 border-x border-gray-200"
      >
        @if (messages().length === 0) {
          <div class="flex items-center justify-center h-full text-gray-400">
            <div class="text-center">
              <p class="text-lg">No hay mensajes aún</p>
              <p class="text-sm">¡Sé el primero en escribir!</p>
            </div>
          </div>
        }

        @for (msg of messages(); track msg.timestamp) {
          <div class="mb-4">
            <div class="flex flex-col">
              <div
                class="max-w-md px-4 py-3 rounded-2xl shadow-sm"
                [ngClass]="msg.sender === currentUser?.username
                  ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white ml-auto rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 mr-auto rounded-bl-sm'"
              >
                @if (msg.sender !== currentUser?.username) {
                  <div class="text-xs font-semibold mb-1 text-blue-600">
                    {{ msg.sender }}
                  </div>
                }
                <p class="text-sm">{{ msg.content }}</p>
                <div class="text-xs mt-1 opacity-75 text-right">
                  {{ msg.timestamp | date:'HH:mm' }}
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Input enviar -->
      <div class="bg-white rounded-b-2xl shadow-lg px-6 py-4 border-t border-gray-200">
        <div class="flex gap-3">
          <input
            [(ngModel)]="messageContent"
            name="message"
            placeholder="Escribe un mensaje..."
            [disabled]="!connected"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            (keyup.enter)="sendMessage()"
          />
          <button
            (click)="sendMessage()"
            [disabled]="!connected || !messageContent.trim()"
            class="px-6 py-3 bg-linear-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </div>
    }

  </div>
</div>
  `
})
export class ChatComponent implements OnInit, OnDestroy {
  messages = signal<ChatMessage[]>([]);
  messageContent = '';
  recipientUsername = '';
  chatStarted = false;
  connected = false;
  currentUser: any = null;

  private subs = new Subscription();

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    this.subs.add(
      this.chatService.connected$.subscribe(c => this.connected = c)
    );

    this.subs.add(
      this.chatService.getMessages().subscribe(msg => {
        this.ngZone.run(() => {
          this.messages.update(msgs => [...msgs, msg]);
          setTimeout(() => this.scrollToBottom(), 0);
        });
      })
    );
  }

  startChat(): void {
    if (this.recipientUsername.trim()) {
      this.chatStarted = true;
    }
  }
  closeChat(): void {
    if (this.recipientUsername.trim()) {
      this.chatStarted = false;
    }
  }


  sendMessage(): void {
    console.log('sendMessage llamado');
    console.log('content:', this.messageContent);
    console.log('recipient:', this.recipientUsername);
    console.log('connected:', this.connected);
    if (this.messageContent.trim() && this.connected) {
      this.chatService.sendMessage(this.messageContent, this.recipientUsername);
      this.messageContent = '';
    }
  }

  isSystemMessage(msg: ChatMessage): boolean {
    return msg.content.includes('join the chat');
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

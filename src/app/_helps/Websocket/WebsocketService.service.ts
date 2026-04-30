import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, Frame, Message } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';

export interface NotificationMessage {
  id?: number;
  type: string;
  status: string;
  message: string;
  subject: string;
  timestamp: string;
  appointmentId: number;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private stompClient!: Client;

  private notificationsSubject = new BehaviorSubject<NotificationMessage[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private connected = false;
  private reconnectDelay = 5000;

  constructor() {}

  connect(userId: string, token: string): void {

    if (this.connected) return;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),

      connectHeaders: {
        Authorization: `Bearer ${token}`
      },

      reconnectDelay: this.reconnectDelay, // 🔥 auto reconnect

      debug: () => {},

      onConnect: (frame: Frame) => {
        console.log('✅ Connecté WebSocket');
        this.connected = true;

        this.subscribeToNotifications(userId);
      },

      onStompError: (frame: Frame) => {
        console.error('❌ STOMP error:', frame.headers['message']);
      },

      onWebSocketClose: () => {
        console.warn('🔌 Déconnecté');
        this.connected = false;
      }
    });

    this.stompClient.activate();
  }

  private subscribeToNotifications(userId: string) {
    this.stompClient.subscribe(`/topic/notifications/${userId}`, (message: Message) => {
      const notification: NotificationMessage = JSON.parse(message.body);

      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...current]); // 🔥 liste
    });
  }

  disconnect(): void {
    this.stompClient?.deactivate();
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
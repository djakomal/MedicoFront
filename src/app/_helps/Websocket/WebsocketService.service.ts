import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Stomp, Client, Frame, Message } from '@stomp/stompjs';
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
  private stompClient: Client | null = null;
  private notificationSubject = new BehaviorSubject<NotificationMessage | null>(null);
  public notifications$ = this.notificationSubject.asObservable();
  private connected = false;

  constructor() {}

  /**
   * Connexion au WebSocket
   */
  connect(userId: string): void {
    if (this.connected) {
      console.log('✅ Déjà connecté au WebSocket');
      return;
    }

    const socket = new SockJS('http://localhost:8080/ws');
    
    this.stompClient = Stomp.over(() => socket);
    
    // Désactiver les logs STOMP pour la production
    this.stompClient.debug = (str) => {
      // console.log(str);
    };

    this.stompClient.onConnect = (frame: Frame) => {
      console.log('✅ Connecté au WebSocket:', frame);
      this.connected = true;

      // S'abonner aux notifications de l'utilisateur
      this.stompClient?.subscribe(`/topic/notifications/${userId}`, (message: Message) => {
        console.log('📨 Notification reçue:', message.body);
        const notification: NotificationMessage = JSON.parse(message.body);
        this.notificationSubject.next(notification);
      });
    };

    this.stompClient.onStompError = (frame: Frame) => {
      console.error('❌ Erreur WebSocket:', frame.headers['message']);
      console.error('Détails:', frame.body);
      this.connected = false;
    };

    this.stompClient.onWebSocketClose = () => {
      console.log('🔌 WebSocket déconnecté');
      this.connected = false;
    };

    this.stompClient.activate();
  }

  /**
   * Déconnexion du WebSocket
   */
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.connected = false;
      console.log('🔌 Déconnecté du WebSocket');
    }
  }

  /**
   * Vérifie si connecté
   */
  isConnected(): boolean {
    return this.connected;
  }
}
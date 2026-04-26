import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Message } from '../models/Message';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { Appoitement } from '../models/appoitement';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private stompClient: Client | null = null;
  private readonly STORAGE_PREFIX = 'medico.notifications.v1.';
  private readonly STORAGE_LIMIT = 100;

  constructor() {
    this.restoreNotificationsFromStorage();
  }

  // ── Flux messages bruts WebSocket (string[]) ─────────────────
  private messageSubject = new BehaviorSubject<string[]>([]);
  public messages$ = this.messageSubject.asObservable();


  private notiSubject = new BehaviorSubject<number>(0);
  public notis$ = this.notiSubject.asObservable();

 
  private notificationsSubject = new BehaviorSubject<Message[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();


  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();



  connect() {
    if (this.stompClient?.active || this.stompClient?.connected) {
      return;
    }

    // Restaurer les notifications persistées (utile après login sans refresh)
    this.restoreNotificationsFromStorage();

    const socket = new SockJS('http://localhost:8080/medico/ws');
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('jwtToken') ||
      localStorage.getItem('authToken');

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
  
      //  AJOUT IMPORTANT
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected: ' + frame);

      // Messages publics
      this.stompClient?.subscribe('/topic/messages', (message) => {
        const parsedMessage = JSON.parse(message.body).messageContent;
        this.addMessage(parsedMessage);
      });

      // Messages privés
      this.stompClient?.subscribe('/user/topic/private-messages', (message) => {
        const parsedMessage = JSON.parse(message.body).messageContent;
        this.addMessage(parsedMessage);
      });

      // Notifications privées
      this.stompClient?.subscribe('/user/topic/private-noti', (message) => {
        this.handleNotiMessage(message);
      });

      // Notifications publiques
      this.stompClient?.subscribe('/topic/public-noti', (message) => {
        this.handleNotiMessage(message);
      });

      //  AJOUT — Notifications structurées par utilisateur
      this.stompClient?.subscribe('/user/topic/appointment-notifications', (message) => {
        try {
          const payload = JSON.parse(message.body);
          const notification = this.normalizeAppointmentNotification(payload);
          this.addStructuredNotification(notification);
        } catch (e) {
          console.error('Erreur parsing notification appointment:', e, message.body);
        }
      });

      // Fallback: certains backends publient sur /topic/notifications/{userId}
      const storedUserId = localStorage.getItem('user_id');
      if (storedUserId) {
        this.stompClient?.subscribe(`/topic/notifications/${storedUserId}`, (message) => {
          try {
            const payload = JSON.parse(message.body);
            const notification = this.normalizeAppointmentNotification(payload);
            this.addStructuredNotification(notification);
          } catch (e) {
            console.error('Erreur parsing notification topic userId:', e, message.body);
          }
        });
      }

      // Fallback: topic public
      this.stompClient?.subscribe('/topic/appointment-notifications', (message) => {
        try {
          const payload = JSON.parse(message.body);
          // Évite d'afficher des notifications d'autres utilisateurs si le topic est broadcast
          if (storedUserId) {
            const payloadUserId = payload?.userId;
            if (payloadUserId == null) return;
            if (String(payloadUserId) !== storedUserId) return;
          }
          const notification = this.normalizeAppointmentNotification(payload);
          this.addStructuredNotification(notification);
        } catch (e) {
          console.error('Erreur parsing notification topic public:', e, message.body);
        }
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.stompClient.activate();
  }

  // ════════════════════════════════════════════════════════════
  //  ENVOI DE MESSAGES
  // ════════════════════════════════════════════════════════════
  disconnect(): void {
    if (!this.stompClient) return;
    this.stompClient.deactivate();
    this.stompClient = null;
  }

  sendMessage(message: string) {
    if (this.stompClient?.connected) {
      this.stompClient?.publish({
        destination: '/app/message',
        body: JSON.stringify({ messageContent: message })
      });
    }
  }

  sendPrivateMessage(message: string) {
    if (this.stompClient?.connected) {
      this.stompClient?.publish({
        destination: '/app/private-message',
        body: JSON.stringify({ messageContent: message })
      });
    }
  }


  //  Récupérer les notifications d'un utilisateur
  getUserNotifications$(userId: number): Observable<Message[]> {
    const requestedUserId = Number(userId);
    return this.notifications$.pipe(
      map((notifications) =>
        notifications.filter((n: any) => {
          const rawUserId = n?.userId;
          const notifUserId =
            typeof rawUserId === 'number' ? rawUserId : Number(rawUserId);

          // Inclure les notifications globales (userId absent/0/NaN),
          // ou celles qui matchent l'utilisateur connecté.
          return !notifUserId || notifUserId === requestedUserId;
        })
      )
    );
  }
  //  utilisé dans appointment.component.ts
  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const notification: Message = {
      id: Date.now(),
      type,
      sender: 'Système',
      subject: type === 'success' ? 'Succès' : type === 'error' ? 'Erreur' : 'Info',
      content: message,
      date: new Date().toLocaleDateString('fr-FR'),
      read: false,
      appointmentId: 0,
      userId: 0
    };
    this.addStructuredNotification(notification);
  }

  //  utilisé dans header.component.ts
  success(message: string): void {
    this.showNotification(message, 'success');
  }

  //  utilisé dans header.component.ts
  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
    this.notiSubject.next(0);
    this.clearNotificationsStorage();
  }

  //  Marquer une notification comme lue
  markAsRead(notificationId: number): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updated);
    this.recalculerNonLus();
    this.persistNotificationsToStorage();
  }

  //  Marquer toutes les notifications d'un utilisateur comme lues
  markAllAsReadForUser(userId: number): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(n =>
      (n.userId === userId || !n.userId) ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updated);
    this.recalculerNonLus();
    this.persistNotificationsToStorage();
  }

  //  Supprimer une notification
  deleteNotification(notificationId: number): void {
    const current = this.notificationsSubject.value;
    const updated = current.filter(n => n.id !== notificationId);
    this.notificationsSubject.next(updated);
    this.recalculerNonLus();
    this.persistNotificationsToStorage();
  }


  resetNotis(): void {
    this.notiSubject.next(0);
    this.unreadCountSubject.next(0);
  }

  notifyUserAppointmentValidated(userId: number, appointment: Appoitement): void {
    const notification: Message = {
      id: Date.now(),
      userId,
      type: 'success',
      sender: 'Médecin',
      subject: 'Rendez-vous validé',
      content: `Votre rendez-vous du ${appointment.preferredDate} à ${appointment.preferredTime} a été validé.`,
      date: new Date().toLocaleDateString('fr-FR'),
      read: false,
      appointmentId: appointment.id,
    };
    this.addStructuredNotification(notification);
  }

  notifyUserAppointmentRejected(userId: number, appointment: Appoitement, reason?: string): void {
    const notification: Message = {
      id: Date.now(),
      userId,
      type: 'error',
      sender: 'Médecin',
      subject: 'Rendez-vous rejeté',
      content: reason 
        ? `Votre rendez-vous du ${appointment.preferredDate} à ${appointment.preferredTime} a été rejeté. Motif: ${reason}`
        : `Votre rendez-vous du ${appointment.preferredDate} à ${appointment.preferredTime} a été rejeté.`,
      date: new Date().toLocaleDateString('fr-FR'),
      read: false,
      appointmentId: appointment.id,
    };
    this.addStructuredNotification(notification);
  }

 
  notifyUserAppointmentStarted(userId: number, appointment: Appoitement, zoomLink: string | undefined): void {
    const notification: Message = {
      id: Date.now(),
      userId,
      type: 'info',
      sender: 'Médecin',
      subject: 'Rendez-vous démarré',
      content: zoomLink
        ? `Votre rendez-vous a débuté. Lien Zoom: ${zoomLink}`
        : `Votre rendez-vous a débuté. Veuillez patienter.`,
      date: new Date().toLocaleDateString('fr-FR'),
      read: false,
      appointmentId: appointment.id,
      zoomLink: zoomLink, // ← stocker le lien
    };
    this.addStructuredNotification(notification);
  }


  private addMessage(message: string) {
    const currentMessages = this.messageSubject.value;
    console.log('MESSAGE ADDED : ' + message);
    this.messageSubject.next([...currentMessages, message]);
  }

  private addNoti() {
    const currentCount = this.notiSubject.value;
    console.log('NOTIFICATION COUNT INCREMENTED : ' + (currentCount + 1));
    this.notiSubject.next(currentCount + 1);
  }

  private addStructuredNotification(notification: Message): void {
    const current = this.notificationsSubject.value;
    const alreadyExists = current.some((n) => {
      if (n.id === notification.id) return true;
      return (
        n.appointmentId === notification.appointmentId &&
        n.userId === notification.userId &&
        n.subject === notification.subject &&
        n.content === notification.content &&
        n.date === notification.date
      );
    });

    if (alreadyExists) return;

    this.notificationsSubject.next([notification, ...current]);
    this.recalculerNonLus();
    this.addNoti();
    this.persistNotificationsToStorage();
  }

  private recalculerNonLus(): void {
    const nonLus = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(nonLus);
  }

  private normalizeAppointmentNotification(payload: any): Message {
    const nowId = Date.now();
    const inferredType =
      payload?.type ||
      (payload?.status === 'validated'
        ? 'success'
        : payload?.status === 'rejected'
          ? 'error'
          : payload?.status === 'started'
            ? 'info'
            : 'info');

    const inferredDate =
      payload?.date ||
      (payload?.timestamp
        ? new Date(payload.timestamp).toLocaleDateString('fr-FR')
        : new Date().toLocaleDateString('fr-FR'));

    const rawUserId = payload?.userId;
    const userId =
      typeof rawUserId === 'number' ? rawUserId : Number(rawUserId) || 0;

    const zoomLink =
      payload?.zoomLink ||
      payload?.meetingUrl ||
      payload?.zoomJoinUrl ||
      payload?.join_url ||
      payload?.joinUrl ||
      payload?.appointment?.meetingUrl ||
      payload?.appointment?.zoomLink ||
      payload?.appointment?.zoomJoinUrl;

    return {
      id: typeof payload?.id === 'number' ? payload.id : nowId,
      userId,
      type: inferredType,
      sender: payload?.sender || 'Système',
      subject:
        payload?.subject ||
        (payload?.status === 'validated'
          ? 'Rendez-vous validé'
          : payload?.status === 'rejected'
            ? 'Rendez-vous rejeté'
            : payload?.status === 'started'
              ? 'Rendez-vous démarré'
              : 'Notification'),
      content:
        payload?.content || payload?.message || payload?.messageContent || '',
      date: inferredDate,
      read: typeof payload?.read === 'boolean' ? payload.read : false,
      appointmentId:
        typeof payload?.appointmentId === 'number'
          ? payload.appointmentId
          : Number(payload?.appointmentId) || 0,
      zoomLink: typeof zoomLink === 'string' ? zoomLink : undefined,
    } as Message;
  }

  private handleNotiMessage(message: any): void {
    const body = message?.body;
    if (!body) {
      this.addNoti();
      return;
    }

    try {
      const payload = JSON.parse(body);
      const hasUsefulData =
        payload?.content ||
        payload?.message ||
        payload?.messageContent ||
        payload?.subject ||
        payload?.status ||
        payload?.type;

      if (!hasUsefulData) {
        this.addNoti();
        return;
      }

      const notification = this.normalizeAppointmentNotification(payload);
      this.addStructuredNotification(notification);
    } catch {
      const text = String(body).trim();
      if (!text) {
        this.addNoti();
        return;
      }

      const notification = this.normalizeAppointmentNotification({ message: text });
      this.addStructuredNotification(notification);
    }
  }

  private getNotificationsStorageKey(): string {
    const userId = localStorage.getItem('user_id') || 'anonymous';
    return `${this.STORAGE_PREFIX}${userId}`;
  }

  private restoreNotificationsFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.getNotificationsStorageKey());
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      const restored = parsed
        .filter((n: any) => n && typeof n === 'object')
        .slice(0, this.STORAGE_LIMIT) as Message[];

      if (restored.length === 0) return;

      this.notificationsSubject.next(restored);
      this.recalculerNonLus();
    } catch (e) {
      console.warn('Impossible de restaurer les notifications:', e);
    }
  }

  private persistNotificationsToStorage(): void {
    try {
      const toStore = this.notificationsSubject.value.slice(0, this.STORAGE_LIMIT);
      localStorage.setItem(this.getNotificationsStorageKey(), JSON.stringify(toStore));
    } catch (e) {
      console.warn('Impossible de persister les notifications:', e);
    }
  }

  private clearNotificationsStorage(): void {
    try {
      localStorage.removeItem(this.getNotificationsStorageKey());
    } catch {}
  }
  notifyUserAppointmentValidatedPresential(userId: number, appointment: Appoitement): void {
    const notification: Message = {
      id: Date.now(),
      userId,
      type: 'success',
      sender: 'Médecin',
      subject: 'Rendez-vous présentiel validé',
      content: `Votre rendez-vous présentiel du ${appointment.preferredDate} à ${appointment.preferredTime} a été validé. Merci de vous présenter au cabinet médical.`,
      date: new Date().toLocaleDateString('fr-FR'),
      read: false,
      appointmentId: appointment.id,
      zoomLink: undefined, // Pas de lien Zoom pour le présentiel
    };
    this.addStructuredNotification(notification);
  }
  
}

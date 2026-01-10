// notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message } from '../models/Message';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Message[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    this.loadNotificationsFromStorage();
  }
  

  // Charger les notifications depuis le localStorage
  private loadNotificationsFromStorage(): void {
    const stored = localStorage.getItem('userNotifications');
    if (stored) {
      const notifications = JSON.parse(stored);
      this.notificationsSubject.next(notifications);
      this.updateUnreadCount();
    }
  }

  // Sauvegarder dans le localStorage
  private saveToStorage(): void {
    localStorage.setItem('userNotifications', JSON.stringify(this.notificationsSubject.value));
  }

  // Ajouter une notification
  addNotification(notification: Omit<Message, 'id' | 'date' | 'read'>): void {
    const newNotification: Message = {
      ...notification,
      id: Date.now(),
      date: new Date().toLocaleString('fr-FR'),
      read: false
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([newNotification, ...currentNotifications]);
    this.updateUnreadCount();
    this.saveToStorage();
  }

  // Créer une notification de rendez-vous validé
  notifyAppointmentValidated(appointment: any): void {
    this.addNotification({
      type: 'success',
      sender: 'Medico',
      subject: '✅ Rendez-vous validé',
      content: `Votre rendez-vous du ${appointment.preferredDate} à ${appointment.preferredTime} a été validé avec succès !`,
      appointmentId: appointment.id
    });
  }

  // Créer une notification de rendez-vous rejeté
  notifyAppointmentRejected(appointment: any): void {
    this.addNotification({
      type: 'alert',
      sender: 'Medico',
      subject: '❌ Rendez-vous rejeté',
      content: `Votre rendez-vous du ${appointment.preferredDate} a été rejeté. Veuillez nous contacter pour plus d'informations.`,
      appointmentId: appointment.id
    });
  }

  // Créer une notification de rendez-vous débuté
  notifyAppointmentStarted(appointment: any): void {
    this.addNotification({
      type: 'info',
      sender: 'Medico',
      subject: '🏥 Rendez-vous en cours',
      content: `Votre rendez-vous du ${appointment.preferredDate} a débuté.`,
      appointmentId: appointment.id
    });
  }

  // Marquer comme lu
  markAsRead(notificationId: number): void {
    const notifications = this.notificationsSubject.value.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
    this.saveToStorage();
  }

  // Marquer tout comme lu
  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
    this.saveToStorage();
  }

  // Supprimer une notification
  deleteNotification(notificationId: number): void {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== notificationId);
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
    this.saveToStorage();
  }

  // Supprimer toutes les notifications
  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
    this.updateUnreadCount();
    this.saveToStorage();
  }

  // Mettre à jour le compteur de non lus
  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  // Obtenir toutes les notifications
  getNotifications(): Message[] {
    return this.notificationsSubject.value;
  }

  // Obtenir le nombre de notifications non lues
  getUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  // Afficher une notification toast (méthode existante)
  showNotification(message: string, type: string): void {
    // Votre implémentation existante
    console.log(`[${type}] ${message}`);
  }
}
// notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Message } from '../models/Message';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  success(arg0: string) {
    throw new Error('Method not implemented.');
  }
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
  addNotification( notification: Omit<Message, 'id' | 'date' | 'read'> & { userId?: number; }): void {
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

    console.log(`📨 Notification créée:`, {
      id: newNotification.id,
      userId: newNotification.userId,
      subject: newNotification.subject
    });
  }
  addUserNotification(userId: number, notificationData: Omit<Message, 'id' | 'date' | 'read' | 'userId'>): void {
    this.addNotification({
      ...notificationData,
      userId: userId // Ici on passe le userId correct
    });
    console.log(`📤 Notification envoyée à userId: ${userId}`);
  }


  // Créer une notification de rendez-vous validé
  notifyUserAppointmentValidated(userId: number, appointment: any): void {
    this.addUserNotification(userId, {
      type: 'success',
      sender: 'Medico',
      subject: ' Rendez-vous validé',
      content: `Votre rendez-vous du ${appointment.preferredDate} à ${appointment.preferredTime} a été validé avec succès !`,
      appointmentId: appointment.id
    });
  }

  // Créer une notification de rendez-vous rejeté
  notifyUserAppointmentRejected(userId: number, appointment: any): void {
    this.addUserNotification(userId, {
      type: 'alert',
      sender: 'Medico',
      subject: '❌ Rendez-vous rejeté',
      content: `Votre rendez-vous du ${appointment.preferredDate} a été rejeté. Veuillez nous contacter pour plus d'informations.`,
      appointmentId: appointment.id,
   
    });
  }

  // Créer une notification de rendez-vous débuté
  notifyUserAppointmentStarted(userId: number, appointment: any): void {
    this.addUserNotification(userId, {
      type: 'info',
      sender: 'Medico',
      subject: '🏥 Rendez-vous en cours',
      content: `Votre rendez-vous du ${appointment.preferredDate} a débuté.`,
      appointmentId: appointment.id,
      
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
  /**
  Marquer tout comme lu
  */
  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
    this.saveToStorage();
  }

  /**
 * Marquer comme lu toutes les notifications d'un utilisateur
 */
markAllAsReadForUser(userId: number): void {
  const notifications = this.notificationsSubject.value.map(n =>
    n.userId === userId ? { ...n, read: true } : n
  );
  this.notificationsSubject.next(notifications);
  this.updateUnreadCount();
  this.saveToStorage();
  console.log(` Toutes les notifications de l'utilisateur ${userId} marquées comme lues`);
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
  resetUnreadCount(): void {
    // Logique pour réinitialiser côté serveur/back-end si nécessaire
    this.unreadCountSubject.next(0); // Émettre 0
}


  
  /**
  Afficher une notification a un user specifique
  */
  getUserNotifications$(userId: number): Observable<Message[]> {
    return this.notifications$.pipe(
      map(notifications => 
        notifications.filter(n => n.userId === userId)
      )
    );
  }
  /**
  Notification non lu 
   */
  getUserUnreadCount$(userId: number): number {
    return this.notificationsSubject.value.filter(
      n => n.userId === userId && !n.read
    ).length;
  }
  

}
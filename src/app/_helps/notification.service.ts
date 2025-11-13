import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private matiereUrl  = "http://localhost:8080/medico/user"
  
  constructor(
    private http: HttpClient
  ) { }

  private notificationSubject = new BehaviorSubject<{ message: string, type: 'success' | 'error' } | null>(null);
  notification = this.notificationSubject.asObservable();
  private notifications: string[] = JSON.parse(localStorage.getItem('notifications') || '[]');
  private notificationsSubject = new BehaviorSubject<string[]>(this.notifications);

  showNotification(message: string, type: 'success' | 'error') {
    this.notificationSubject.next({ message, type });
    setTimeout(() => {
      this.notificationSubject.next(null);
    }, 5000); // Masquer après 5 secondes
  }
  
  getNotifications() {
    return this.notificationsSubject.asObservable();
  }

  addNotification(message: string) {
    this.notifications.push(message);
    this.notificationsSubject.next(this.notifications);
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  clearNotifications() {
    this.notifications = [];
    this.notificationsSubject.next(this.notifications);
    localStorage.removeItem('notifications');
  }
   getAllRegister():Observable<User[]> {
    return this.http.get<User[]>(`${this.matiereUrl}`);
  }
  }

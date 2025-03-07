import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationService } from '../../_helps/notification.service';
import { AppointmentComponent } from '../main/appointment/appointment.component';

import { Router } from '@angular/router';
import { AppointementService } from '../../_helps/appointement.service';
import { Appoitement } from '../../models/appoitement';
import { JwtService } from '../../_helps/jwt.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule,AppointmentComponent],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit{
  // notification: { message: string, type: 'success' | 'error' } | null = null;

  // constructor(private notificationService: NotificationService) {}

  // ngOnInit() {
  //   this.notificationService.notification.subscribe(notification => {
  //     this.notification = notification;
  //     setTimeout(() => this.notification = null, 5000); // Masquer après 5 secondes
  //   });
  // }
  notifications: string[] = [];
  selectedUser:Appoitement | null = null;
  tableauClasse!:Appoitement[]

  constructor(private notificationService: NotificationService,
    private router:Router,
    private register :JwtService,
    private appointement:AppointementService
  ) {}

  ngOnInit() {
    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  clearNotifications() {
    this.notificationService.clearNotifications();
  }

  viewAppDetails(id: number) {
    this.appointement.getAppById(id).subscribe(user => {
      this.selectedUser = user;
      
    });
  }
  
  }


  


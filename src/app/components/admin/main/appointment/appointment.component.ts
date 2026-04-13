import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';


import { FormulaireComponent } from '../../formulaire/formulaire.component';
import { Appoitement } from '../../../../models/appoitement';

import { NotificationService } from '../../../../_helps/notification.service';
import { AppointementService, AppointmentResponse } from '../../../../_helps/appointment/appointement.service';





@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css'
})
export class AppointmentComponent  implements OnInit{
  tableauClasse!:Appoitement[]

  constructor( private router :Router
    ,
    private appointementService:AppointementService,
    private notificationService: NotificationService
  ){

  }
 ngOnInit(): void {
  
  this.getAppointment();
 }
 getAppointment() {
  this.appointementService.getAllAppointment().subscribe({
    next: (data) => {
      console.log(" Données reçues :", data);
      
      if (Array.isArray(data)) {
        this.tableauClasse = data;
      } else {
        console.error("Format des données incorrect :", data);
      }
    },
    error: (error) => {
      console.error("Erreur API :", error);
    }
  });
}

redirection(){
  this.router.navigateByUrl("Admin/form")
}

private parseAppointmentDateTime(app: Appoitement): Date | null {
  if (!app?.preferredDate || !app?.preferredTime) {
    return null;
  }

  let datePart = app.preferredDate.trim();
  const timePart = app.preferredTime.trim();

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(datePart)) {
    const [day, month, year] = datePart.split('/');
    datePart = `${year}-${month}-${day}`;
  }

  const dateTime = new Date(`${datePart}T${timePart}`);
  return isNaN(dateTime.getTime()) ? null : dateTime;
}

isAppointmentTimeReached(app: Appoitement): boolean {
  const appointmentDateTime = this.parseAppointmentDateTime(app);
  return appointmentDateTime ? new Date() >= appointmentDateTime : false;
}

canValidate(app: Appoitement): boolean {
  return !!app && app.status === 'pending' && this.isAppointmentTimeReached(app);
}

canStart(app: Appoitement): boolean {
  return !!app && app.status === 'validated' && this.isAppointmentTimeReached(app);
}

canReject(app: Appoitement): boolean {
  return !!app && app.status === 'pending';
}

// validerRendezVous(id: number) {
  //   const appointement = this.tableauClasse.find(app => app.id === id);
  //   if (appointement) {
  //     appointement.statut = 'Validé';
  //     this.notificationService.showNotification(`Rendez-vous ${id} validé avec succès.`, 'success');
  //   }
  // }

  // rejeterRendezVous(id: number) {
  //   const appointement = this.tableauClasse.find(app => app.id === id);
  //   if (appointement) {
  //     appointement.statut = 'Rejeté';
  //     this.notificationService.showNotification(`Rendez-vous ${id} rejeté.`, 'error');
  //   }
  // }


  validerRendezVous(id: number): void {
    const appointement = this.tableauClasse?.find(app => app.id === id);
    if (!appointement || !this.canValidate(appointement)) {
      this.notificationService.showNotification(
        'Impossible de valider ce rendez-vous pour le moment.',
        'error'
      );
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir valider ce rendez-vous ?')) return;

    this.appointementService.validateAppointment(id).subscribe({
      next: (response: AppointmentResponse) => {
        if (response?.success) {
          this.notificationService.showNotification(
            response.message || `Rendez-vous ${id} validé avec succès.`,
            'success'
          );
          this.getAppointment();
        } else {
          this.notificationService.showNotification(
            response?.message || 'Erreur lors de la validation du rendez-vous.',
            'error'
          );
        }
      },
      error: (error) => {
        console.error('Erreur validation rendez-vous:', error);
        this.notificationService.showNotification(
          'Erreur lors de la validation du rendez-vous.',
          'error'
        );
      },
    });
  }
  
  rejeterRendezVous(id: number): void {
    const appointement = this.tableauClasse?.find(app => app.id === id);
    if (!appointement || !this.canReject(appointement)) {
      this.notificationService.showNotification(
        'Impossible d\'annuler ce rendez-vous après validation.',
        'error'
      );
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir rejeter ce rendez-vous ?')) return;

    this.appointementService.rejectAppointment(id).subscribe({
      next: (response: AppointmentResponse) => {
        if (response?.success) {
          this.notificationService.showNotification(
            response.message || `Rendez-vous ${id} rejeté.`,
            'success'
          );
          this.getAppointment();
        } else {
          this.notificationService.showNotification(
            response?.message || 'Erreur lors du rejet du rendez-vous.',
            'error'
          );
        }
      },
      error: (error) => {
        console.error('Erreur rejet rendez-vous:', error);
        this.notificationService.showNotification(
          'Erreur lors du rejet du rendez-vous.',
          'error'
        );
      },
    });
  }
  
  debuterRendezVous(id: number): void {
    const appointement = this.tableauClasse?.find(app => app.id === id);
    if (!appointement || !this.canStart(appointement)) {
      this.notificationService.showNotification(
        'Impossible de démarrer ce rendez-vous pour le moment.',
        'error'
      );
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir débuter ce rendez-vous ?')) return;

    this.appointementService.startAppointment(id).subscribe({
      next: (response: AppointmentResponse) => {
        if (response?.success) {
          this.notificationService.showNotification(
            response.message || `Rendez-vous ${id} démarré.`,
            'success'
          );
          this.getAppointment();
        } else {
          this.notificationService.showNotification(
            response?.message || 'Erreur lors du démarrage du rendez-vous.',
            'error'
          );
        }
      },
      error: (error) => {
        console.error('Erreur démarrage rendez-vous:', error);
        this.notificationService.showNotification(
          'Erreur lors du démarrage du rendez-vous.',
          'error'
        );
      },
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';


import { FormulaireComponent } from '../../formulaire/formulaire.component';
import { Appoitement } from '../../../../models/appoitement';

import { NotificationService } from '../../../../_helps/notification.service';
import { AppointTypeServiceService } from '../../../../_helps/appointment/appoint-type-service.service';
import { AppointementService } from '../../../../_helps/appointment/appointement.service';





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


  validerRendezVous(id: number) {
    const appointement = this.tableauClasse.find(app => app.id === id);
    if (appointement) {
      appointement.status = 'validated';
      this.notificationService.showNotification(`Rendez-vous ${id} validé avec succès.`, 'success');
    }
    // votre logique pour valider le rendez-vous
    // Supprimé : this.notificationService.addNotification('success'); // Évite l'erreur de type
  }
  
  rejeterRendezVous(id: number) {
    const appointement = this.tableauClasse.find(app => app.id === id);
    if (appointement) {
      appointement.status = 'rejected';
      this.notificationService.showNotification(`Rendez-vous ${id} rejeté.`, 'error');
    }
    // votre logique pour rejeter le rendez-vous
    // Supprimé : this.notificationService.addNotification('error'); // Évite l'erreur de type
  }
  
  debuterRendezVous(id: number) {
    const appointement = this.tableauClasse.find(app => app.id === id);
    if (appointement) {
      appointement.status = 'pending';
      this.notificationService.showNotification(`Rendez-vous ${id} démarré.`, 'success');
    }
  }
}



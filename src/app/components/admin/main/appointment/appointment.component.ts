import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';


import { NotificationComponent } from '../../notification/notification.component';
import { FormulaireComponent } from '../../formulaire/formulaire.component';
import { Appoitement } from '../../../../models/appoitement';
import { AppointementService } from '../../../../_helps/appointement.service';
import { NotificationService } from '../../../../_helps/notification.service';
import { AppoitementType } from '../../../../models/appoitementType';
import { AppointTypeServiceService } from '../../../../_helps/appoint-type-service.service';




@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule ,FormulaireComponent],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css'
})
export class AppointmentComponent  implements OnInit{
  tableauClasse!:AppoitementType[]

  constructor( private router :Router
    ,
    private appointementService:AppointTypeServiceService,
    private notificationService: NotificationService
  ){

  }
 ngOnInit(): void {
  
  this.getAppointment();
 }
 getAppointment() {
  this.appointementService.getAllAppointmentType().subscribe({
    next: (data) => {
      console.log("📌 Données reçues :", data);
      
      if (Array.isArray(data)) {
        this.tableauClasse = data;
      } else {
        console.error("❌ Format des données incorrect :", data);
      }
    },
    error: (error) => {
      console.error("❌ Erreur API :", error);
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
         appointement.statut = 'Validé';
         this.notificationService.showNotification(`Rendez-vous ${id} validé avec succès.`, 'success');
       }
    // votre logique pour valider le rendez-vous
    this.notificationService.addNotification('Rendez-vous validé avec succès!');
  }

  rejeterRendezVous(id: number) {
    const appointement = this.tableauClasse.find(app => app.id === id);
       if (appointement) {
         appointement.statut = 'Rejeté';
         this.notificationService.showNotification(`Rendez-vous ${id} rejeté.`, 'error');
       }
    // votre logique pour rejeter le rendez-vous
    this.notificationService.addNotification('Rendez-vous rejeté!');
  }

  debuterRendezVous(id: number) {
    const appointement = this.tableauClasse.find(app => app.id === id);
    if (appointement) {
      appointement.statut = 'En cours';
      this.notificationService.showNotification(`Rendez-vous ${id} démarré.`, 'success');
    }
  }
}



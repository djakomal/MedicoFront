import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';


import { NotificationComponent } from '../../notification/notification.component';
import { FormulaireComponent } from '../../formulaire/formulaire.component';
import { Appoitement } from '../../../../models/appoitement';
import { AppointementService } from '../../../../_helps/appointement.service';
import { NotificationService } from '../../../../_helps/notification.service';




@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule ,FormulaireComponent],
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
     this.getAppointment()
 }
 getAppointment() {
  this.appointementService.getAllAppointment().subscribe(
    (data) => {
      this.tableauClasse = data;
      console.log(data)
    },
    (error) => {
      console.log(error);
    }
  )
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



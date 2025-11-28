
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppointTypeServiceService } from '../../../../_helps/appointment/appoint-type-service.service';
import  { AppointementService } from '../../../../_helps/appointment/appointement.service';
import { NotificationService } from '../../../../_helps/notification.service';
import { Appoitement } from '../../../../models/appoitement';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppoitementType } from '../../../../models/appoitementType';


@Component({
  selector: 'app-mes-rendez-vous',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './mes-rendez-vous.component.html',
  styleUrls: ['./mes-rendez-vous.component.css']
})
export class MesRendezVousComponent  implements OnInit {
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
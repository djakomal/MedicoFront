
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import  { AppointementService, AppointmentResponse } from '../../../../_helps/appointment/appointement.service';
import { NotificationService } from '../../../../_helps/notification.service';
import { Appoitement } from '../../../../models/appoitement';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Message } from '../../../../models/Message';


@Component({
  selector: 'app-mes-rendez-vous',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './mes-rendez-vous.component.html',
  styleUrls: ['./mes-rendez-vous.component.css']
})
export class MesRendezVousComponent  implements OnInit {
  tableauClasse:Appoitement[]=[];
  messageList!:Message[];
  // Messages de notification
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'success';
  
  constructor( private router :Router,
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
  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.alertMessage = message;      // Texte à afficher
    this.alertType = type;            // Type de notification (couleur)
    this.showAlert = true;            // Afficher la notification
  
    // Masquer automatiquement après 5 secondes
    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }
  
  hideNotification(): void {
    this.showAlert = false;
  }
  
  redirection(){
    this.router.navigateByUrl("Admin/form")
  }

 // Valider un rendez-vous
  validerRendezVous(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir valider ce rendez-vous ?')) {
      this.appointementService.validateAppointment(id).subscribe({
        next: (response: AppointmentResponse) => {
          if (response.success) {
            this.showNotification( 'Rendez-vous validé et notification envoyée',
              'success');
            this.getAppointment(); // Recharger la liste
          } else {
            this.showNotification(response.message, 'error');
          }
        },
        error: (error) => {
          this.showNotification('Erreur lors de la validation du rendez-vous', 'error');
          console.error('Error validating appointment:', error);
        }
      });
    }
  }

  // Rejeter un rendez-vous
  rejeterRendezVous(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir rejeter ce rendez-vous ?')) {
      this.appointementService.rejectAppointment(id).subscribe({
        next: (response: AppointmentResponse) => {
          if (response.success) {
            this.showNotification(response.message, 'success');
            this.getAppointment(); // Recharger la liste
          } else {
            this.showNotification(response.message, 'error');
          }
        },
        error: (error) => {
          this.showNotification('Erreur lors du rejet du rendez-vous', 'error');
          console.error('Error rejecting appointment:', error);
        }
      });
    }
  }

  // Débuter un rendez-vous
  debuterRendezVous(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir débuter ce rendez-vous ?')) {
      this.appointementService.startAppointment(id).subscribe({
        next: (response: AppointmentResponse) => {
          if (response.success) {
            this.showNotification(response.message, 'success');
            this.getAppointment(); // Recharger la liste
          } else {
            this.showNotification(response.message, 'error');
          }
        },
        error: (error) => {
          this.showNotification('Erreur lors du démarrage du rendez-vous', 'error');
          console.error('Error starting appointment:', error);
        }
      });
    }
  }
  getCountByStatus(status: string): number {
    if (!this.tableauClasse) return 0;
    return this.tableauClasse.filter(app => app.status === status).length;
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'pending': 'En attente',
      'validated': 'Validé',
      'rejected': 'Rejeté',  
      'started': 'En cours'
    };
    return labels[status] || status;
  }
  
}
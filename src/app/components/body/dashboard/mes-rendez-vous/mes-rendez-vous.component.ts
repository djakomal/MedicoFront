
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

  // Dans mes-rendez-vous.component.ts

  // Valider un rendez-vous avec notification
  validerRendezVous(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir valider ce rendez-vous ?')) {
      // Trouver le rendez-vous pour obtenir l'ID utilisateur
      const appointment = this.tableauClasse.find(app => app.id === id);
      
      if (!appointment) {
        this.showNotification('Rendez-vous non trouvé', 'error');
        return;
      }
      
      this.appointementService.validateAppointment(id).subscribe({
        next: (response: AppointmentResponse) => {
          if (response.success) {
            // Envoyer une notification à l'utilisateur
            this.sendValidationNotification(appointment);
            
            this.showNotification('Rendez-vous validé et notification envoyée', 'success');
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
  
  // Rejeter un rendez-vous avec notification
  rejeterRendezVous(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir rejeter ce rendez-vous ?')) {
      // Trouver le rendez-vous pour obtenir l'ID utilisateur
      const appointment = this.tableauClasse.find(app => app.id === id);
      
      if (!appointment) {
        this.showNotification('Rendez-vous non trouvé', 'error');
        return;
      }
      
      this.appointementService.rejectAppointment(id).subscribe({
        next: (response: AppointmentResponse) => {
          if (response.success) {
            // Envoyer une notification à l'utilisateur
            this.sendRejectionNotification(appointment);
            
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
  
  // Débuter un rendez-vous avec notification
  debuterRendezVous(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir débuter ce rendez-vous ?')) {
      // Trouver le rendez-vous pour obtenir l'ID utilisateur
      const appointment = this.tableauClasse.find(app => app.id === id);
      
      if (!appointment) {
        this.showNotification('Rendez-vous non trouvé', 'error');
        return;
      }
      
      this.appointementService.startAppointment(id).subscribe({
        next: (response: AppointmentResponse) => {
          if (response.success) {
            // Envoyer une notification à l'utilisateur
            this.sendStartNotification(appointment);
            
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




  // Méthodes pour envoyer les notifications
private sendValidationNotification(appointment: Appoitement): void {
  // Obtenir l'ID utilisateur du rendez-vous
  const userId = this.getUserIdFromAppointment(appointment);
  const notifId=Number(userId);
  
  if (userId) {
    this.notificationService.notifyUserAppointmentValidated(userId, appointment);
    console.log(`Notification de validation envoyée à l'utilisateur ${userId}`);
  } else {
    // Fallback: notification sans userId
    this.notificationService.notifyUserAppointmentValidated(notifId,appointment);
    console.log(' Notification de validation envoyée (sans userId spécifique)');
  }
}

private sendRejectionNotification(appointment: Appoitement): void {
  const userId = this.getUserIdFromAppointment(appointment);
  const notifId=Number(userId);
  
  if (userId) {
    this.notificationService.notifyUserAppointmentRejected(userId, appointment);
    console.log(`❌ Notification de rejet envoyée à l'utilisateur ${userId}`);
  } else {
    this.notificationService.notifyUserAppointmentRejected(notifId,appointment);
    console.log('⚠️ Notification de rejet envoyée (sans userId spécifique)');
  }
}

private sendStartNotification(appointment: Appoitement): void {
  const userId = this.getUserIdFromAppointment(appointment);
  const notifId=Number(userId);
  if (userId) {
    this.notificationService.notifyUserAppointmentStarted(userId, appointment);
    console.log(`🏥 Notification de démarrage envoyée à l'utilisateur ${userId}`);
  } else {
    this.notificationService.notifyUserAppointmentStarted(notifId,appointment);
    console.log('⚠️ Notification de démarrage envoyée (sans userId spécifique)');
  }
}

// Méthode pour extraire l'ID utilisateur d'un rendez-vous
private getUserIdFromAppointment(appointment: Appoitement): number | null {
  // Vérifier différents champs possibles
  if (appointment.id) {
    return appointment.id;
  }
  

  
  // Vérifier d'autres champs possibles
  const possibleFields = ['user_id', 'patient_id', 'customer_id', 'clientId'];
  for (const field of possibleFields) {
    if (appointment[field as keyof Appoitement]) {
      const value = appointment[field as keyof Appoitement];
      return Number(value);
    }
  }
  
  console.warn(`❌ Aucun ID utilisateur trouvé pour le rendez-vous ${appointment.id}`);
  return null;
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
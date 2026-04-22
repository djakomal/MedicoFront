
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import  { AppointementService, AppointmentResponse } from '../../../../_helps/appointment/appointement.service';
import { NotificationService } from '../../../../_helps/notification.service';
import { Appoitement } from '../../../../models/appoitement';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Message } from '../../../../models/Message';
import { JwtService } from '../../../../_helps/jwt/jwt.service';


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
  
  // Modal de confirmation
  showConfirmModal: boolean = false;
  pendingAction: string = '';
  pendingId: number | null = null;
  pendingAppointment: Appoitement | null = null;
  // CORRECTION: Modal de rejet avec motif
  showRejectModal: boolean = false;
  rejectReason: string = '';
  rejectAppointmentId: number | null = null;
  
  constructor( private router :Router,
      private appointementService:AppointementService,
      private notificationService: NotificationService,
      private jwtService: JwtService 
    ){
  
    }
   ngOnInit(): void {
    this.getAppointment();
   }
   getAppointment() {
    const doctorId = this.jwtService.getDoctorId();
    if (!doctorId) {
    console.error(' ID docteur introuvable dans le token');
    return;
  }

    this.appointementService.getAppointmentsByDoctor(doctorId).subscribe({
      next: (data) => {
        console.log(" Données reçues :", data);
        console.log("Id docteur depuis le token :", doctorId);
        
        if (Array.isArray(data)) {
          this.tableauClasse = data;
          
          //  Afficher le premier rendez-vous pour voir les champs
          if (data.length > 0) {
            console.log('Tous les champs du premier rendez-vous:', Object.keys(data[0]));
            console.log('Contenu complet:', data[0]);
            
            // Vérifier spécifiquement patientId
            if (data[0].patient?.id !== undefined) {
              console.log('patientId existe:', data[0].patient?.id);
            } else {
              console.log('patientId est manquant');
              console.log('Champs disponibles:', Object.keys(data[0]).join(', '));
            }
          }
        }
      },
      error: (error) => {
        console.error(" Erreur API :", error);
      }
    });
  }

  hasZoomLink(app: Appoitement): boolean {
    return !!((app as any).zoomJoinUrl || app.meetingUrl || app.zoomLink);
  }
  
  getZoomLink(app: Appoitement): string | undefined {
    return (app as any).zoomJoinUrl || app.meetingUrl || app.zoomLink;
  }
  joinZoom(link?: string) {
    if (link) {
      window.open(link, '_blank');
    } else {
      this.showNotification('Lien Zoom introuvable', 'error');
    }
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

  // Gestion de la modale de confirmation
  openConfirmModal(action: string, id: number, appointment: Appoitement): void {
    this.pendingAction = action;
    this.pendingId = id;
    this.pendingAppointment = appointment;
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.pendingAction = '';
    this.pendingId = null;
    this.pendingAppointment = null;
  }
  // CORRECTION: Ouvrir le modal de rejet
  openRejectModal(id: number, appointment: Appoitement): void {
    this.rejectAppointmentId = id;
    this.pendingAppointment = appointment;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  // CORRECTION: Fermer le modal de rejet
  closeRejectModal(): void {
    this.showRejectModal = false;
    this.rejectReason = '';
    this.rejectAppointmentId = null;
    this.pendingAppointment = null;
  }

  // CORRECTION: Confirmer le rejet avec motif
  confirmReject(): void {
    if (!this.rejectReason.trim()) {
      this.showNotification('Veuillez saisir un motif de rejet', 'error');
      return;
    }

    if (this.rejectAppointmentId && this.pendingAppointment) {
      this.rejectAppointmentAction(this.rejectAppointmentId, this.pendingAppointment, this.rejectReason);
      this.closeRejectModal();
    }
  }

  getModalTitle(): string {
    const titles: any = {
      'validate': 'Valider le rendez-vous',
      'reject': 'Rejeter le rendez-vous',
      'start': 'Démarrer le rendez-vous',
      'delete': 'Supprimer le rendez-vous'
    };
    return titles[this.pendingAction] || 'Confirmation';
  }

  getModalMessage(): string {
    const messages: any = {
      'validate': `Êtes-vous sûr de vouloir valider le rendez-vous de ${this.pendingAppointment?.firstname} ${this.pendingAppointment?.lastname} ?`,
      'reject': `Êtes-vous sûr de vouloir rejeter le rendez-vous de ${this.pendingAppointment?.firstname} ${this.pendingAppointment?.lastname} ?`,
      'start': `Êtes-vous sûr de vouloir démarrer le rendez-vous de ${this.pendingAppointment?.firstname} ${this.pendingAppointment?.lastname} ?`,
      'delete': `Êtes-vous sûr de vouloir supprimer le rendez-vous de ${this.pendingAppointment?.firstname} ${this.pendingAppointment?.lastname} ? Cette action ne peut pas être annulée.`
    };
    return messages[this.pendingAction] || 'Êtes-vous sûr ?';
  }

  getModalActionButtonText(): string {
    const texts: any = {
      'validate': 'Valider',
      'reject': 'Rejeter',
      'start': 'Démarrer',
      'delete': 'Supprimer'
    };
    return texts[this.pendingAction] || 'Confirmer';
  }

  getModalActionButtonClass(): string {
    const classes: any = {
      'validate': 'btn-confirm btn-success',
      'reject': 'btn-confirm btn-danger',
      'start': 'btn-confirm btn-primary',
      'delete': 'btn-confirm btn-delete-action'
    };
    return classes[this.pendingAction] || 'btn-confirm';
  }

  confirmAction(): void {
    if (!this.pendingId || !this.pendingAppointment) return;

    switch (this.pendingAction) {
      case 'validate':
        this.validateAppointmentAction(this.pendingId, this.pendingAppointment);
        break;
      case 'reject':
        this.rejectAppointmentAction(this.pendingId, this.pendingAppointment);
        break;
      case 'start':
        this.startAppointmentAction(this.pendingId, this.pendingAppointment);
        break;
      case 'delete':
        this.deleteAppointmentAction(this.pendingId, this.pendingAppointment);
        break;
    }
    this.closeConfirmModal();
  }

  // Valider un rendez-vous avec notification
  private validateAppointmentAction(id: number, appointment: Appoitement): void {
    this.appointementService.validateAppointment(id).subscribe({
      next: (response: AppointmentResponse) => {
        if (response.success) {
          this.sendValidationNotification(appointment);
          this.showNotification('Rendez-vous validé et notification envoyée', 'success');
          this.getAppointment();
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
  
  // Rejeter un rendez-vous avec notification
  // CORRECTION: Rejeter un rendez-vous avec motif
  private rejectAppointmentAction(id: number, appointment: Appoitement, reason?: string): void {
    console.log('❌ Rejet du rendez-vous ID:', id, 'Motif:', reason);
    
    this.appointementService.rejectAppointment(id).subscribe({
      next: (response: AppointmentResponse) => {
        if (response.success) {
          this.sendRejectionNotification(appointment, reason);
          this.showNotification(`Rendez-vous rejeté. Motif: ${reason}`, 'success');
          this.getAppointment();
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
  

  private startAppointmentAction(id: number, appointment: Appoitement): void {
    this.appointementService.startAppointment(id).subscribe({
        next: (response: AppointmentResponse) => {
            if (response.success) {
                const patientLink = response.joinUrl                      // pour notifier le patient
                                 || response.appointment?.zoomJoinUrl;

                const doctorLink  = (response as any).startUrl            // lien hôte pour le docteur
                                 || response.appointment?.zoomStartUrl
                                 || patientLink;                          // fallback seulement

                this.sendStartNotification(appointment, patientLink);     // patient reçoit join_url
                this.showNotification('Rendez-vous démarré.', 'success');
                this.getAppointment();

                if (doctorLink) {
                    window.open(doctorLink, '_blank'); // ← docteur entre en tant qu'hôte
                }
            }
        }
    });
}

  // CORRECTION: Méthode d'aide pour extraire le lien Zoom avec logique de secours
  private extractZoomLink(response: AppointmentResponse, appointment: Appoitement): string | undefined {
    // Essayer plusieurs noms de champs possibles pour le lien Zoom
    const zoomLink = 
      response.zoomLink ||                          
      response.appointment?.zoomJoinUrl ||          
      response.appointment?.meetingUrl || 
      response.appointment?.zoomLink ||
      (response as any)?.zoomJoinUrl ||             
      (response as any)?.meetingUrl ||
      (response as any)?.join_url ||
      (appointment as any).zoomJoinUrl ||           
      appointment.meetingUrl ||
      appointment.zoomLink;
    
    if (zoomLink) {
      console.log('✅ Lien Zoom trouvé:', zoomLink);
    } else {
      console.warn('⚠️ Aucun lien Zoom trouvé. Champs disponibles:', {
        'response.zoomLink': response.zoomLink,
        'response.appointment?.zoomJoinUrl': response.appointment?.zoomJoinUrl,
        'appointment.zoomJoinUrl': (appointment as any).zoomJoinUrl,
        'appointment.meetingUrl': appointment.meetingUrl,
      });
    }
    
    return zoomLink;
  }
  // Supprimer un rendez-vous
  private deleteAppointmentAction(id: number, appointment: Appoitement): void {
    this.appointementService.deleteAppointment(id).subscribe({
      next: (response: any) => {
        this.showNotification('Rendez-vous supprimé avec succès', 'success');
        this.getAppointment();
      },
      error: (error) => {
        this.showNotification('Erreur lors de la suppression du rendez-vous', 'error');
        console.error('Error deleting appointment:', error);
      }
    });
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

// CORRECTION: Notification de rejet avec motif
  private sendRejectionNotification(appointment: Appoitement, reason?: string): void {
    const userId = this.getUserIdFromAppointment(appointment);
    const notifId=Number(userId);
    
    console.log(`❌ Notification de rejet envoyée - userId: ${userId}, motif: ${reason}`);
    
    if (userId) {
      this.notificationService.notifyUserAppointmentRejected(userId, appointment, reason);
    } else {
      this.notificationService.notifyUserAppointmentRejected(notifId, appointment, reason);
    }
  }

  // CORRECTION: Notification de démarrage avec lien Zoom
  private sendStartNotification(appointment: Appoitement, zoomLink?: string): void {
    const userId = this.getUserIdFromAppointment(appointment);
    const notifId = Number(userId);
    
    console.log('📧 Envoi notification de démarrage');
    console.log('  - userId:', userId);
    console.log('  - zoomLink param:', zoomLink);
    console.log('  - appointment.zoomJoinUrl:', (appointment as any).zoomJoinUrl);
    console.log('  - appointment.meetingUrl:', appointment.meetingUrl);
    
    // CORRECTION: Utiliser le lien Zoom du rendez-vous si pas fourni
    const finalZoomLink = zoomLink || (appointment as any).zoomJoinUrl || appointment.meetingUrl;
    
    if (userId) {
      this.notificationService.notifyUserAppointmentStarted(userId, appointment, finalZoomLink);
      console.log(`✅ Notification de démarrage envoyée à l'utilisateur ${userId} avec lien: ${finalZoomLink}`);
    } else {
      this.notificationService.notifyUserAppointmentStarted(notifId, appointment, finalZoomLink);
      console.log(`⚠️ Notification de démarrage envoyée avec notifId ${notifId} avec lien: ${finalZoomLink}`);
    }
  }

// Méthode pour extraire l'ID utilisateur d'un rendez-vous
// CORRECTION: Méthode pour extraire l'ID utilisateur d'un rendez-vous
  private getUserIdFromAppointment(appointment: Appoitement): number | null {
    // CORRECTION: Vérifier d'abord patientId (champ direct)
    if ((appointment as any).patientId && (appointment as any).patientId > 0) {
      console.log('✅ ID patient trouvé dans patientId:', (appointment as any).patientId);
      return (appointment as any).patientId;
    }
    
    // Fallback: Vérifier si patient existe et a un id
    if (appointment.patient && appointment.patient.id) {
      console.log('✅ ID patient trouvé dans l\'objet patient:', appointment.patient.id);
      return appointment.patient.id;
    }
    
    // Fallback: Utiliser l'ID de l'utilisateur connecté depuis le JWT
    const connectedUserId = this.jwtService.getUserId();
    if (connectedUserId && connectedUserId > 0) {
      console.log('✅ ID patient trouvé depuis JWT:', connectedUserId);
      return connectedUserId;
    }
    
    console.warn('❌ Impossible de trouver l\'ID patient pour le rendez-vous:', appointment);
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
  

  // CORRECTION: Vérifier si l'heure du rendez-vous est passée
isAppointmentTimePassed(appointment: Appoitement): boolean {
  if (!appointment.preferredDate || !appointment.preferredTime) {
    return false;
  }

  try {
    // Parser la date et l'heure
    let appointmentDate: Date;
    
    if (appointment.preferredDate.includes('-')) {
      // Format: YYYY-MM-DD
      const [year, month, day] = appointment.preferredDate.split('-').map(Number);
      appointmentDate = new Date(year, month - 1, day);
    } else if (appointment.preferredDate.includes('/')) {
      // Format: DD/MM/YYYY
      const [day, month, year] = appointment.preferredDate.split('/').map(Number);
      appointmentDate = new Date(year, month - 1, day);
    } else {
      appointmentDate = new Date(appointment.preferredDate);
    }

    // Parser l'heure
    const [hours, minutes] = appointment.preferredTime.split(':').map(Number);
    appointmentDate.setHours(hours, minutes || 0, 0, 0);

    // Comparer avec l'heure actuelle
    const now = new Date();
    const isPassed = now > appointmentDate;

    return isPassed;
  } catch (error) {
    console.error('Erreur lors du parsing de la date:', error);
    return false;
  }
}


}

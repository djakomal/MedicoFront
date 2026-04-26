
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
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'success';
  showConfirmModal: boolean = false;
  pendingAction: string = '';
  pendingId: number | null = null;
  pendingAppointment: Appoitement | null = null;
  showRejectModal: boolean = false;
  rejectReason: string = '';
  rejectAppointmentId: number | null = null;
  
    // Dans MesRendezVousComponent
  showDocumentsModal: boolean = false;
  selectedPatientDocuments: any[] = [];
  selectedPatientName: string = '';
  isLoadingDocuments: boolean = false;
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
    this.alertMessage = message;     
    this.alertType = type;          
    this.showAlert = true;            
  
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

  openRejectModal(id: number, appointment: Appoitement): void {
    this.rejectAppointmentId = id;
    this.pendingAppointment = appointment;
    this.rejectReason = '';
    this.showRejectModal = true;
  }


  closeRejectModal(): void {
    this.showRejectModal = false;
    this.rejectReason = '';
    this.rejectAppointmentId = null;
    this.pendingAppointment = null;
  }

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

  private sendValidationNotificationPresential(appointment: Appoitement): void {
    const userId = this.getUserIdFromAppointment(appointment);
    
    if (userId) {
      this.notificationService.notifyUserAppointmentValidatedPresential(userId, appointment);
      console.log(`Notification présentiel envoyée à l'utilisateur ${userId}`);
    }
  }
  private validateAppointmentAction(id: number, appointment: Appoitement): void {
    this.appointementService.validateAppointment(id).subscribe({
      next: (response: AppointmentResponse) => {
        if (response.success) {
          // Envoyer notification (sans lien Zoom pour présentiel)
          if (appointment.appointmentType === 'presential') {
            this.sendValidationNotificationPresential(appointment);
          } else {
            this.sendValidationNotification(appointment);
          }
          
          this.showNotification('Rendez-vous validé', 'success');
          this.getAppointment();
        } else {
          this.showNotification(response.message, 'error');
        }
      },
      error: (error) => {
        this.showNotification('Erreur lors de la validation', 'error');
        console.error('Error validating appointment:', error);
      }
    });
  }
  

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

joinAsHost(app: Appoitement): void {
  // start_url = lien hôte qui identifie le docteur comme host Zoom
  const startUrl = (app as any).zoomStartUrl
                || (app as any).startUrl;

  if (startUrl) {
    window.open(startUrl, '_blank');
  } else {
    // Fallback si start_url non disponible : redemander au backend
    this.appointementService.startAppointment(app.id).subscribe({
      next: (response: AppointmentResponse) => {
        const url = (response as any).startUrl
                 || response.appointment?.zoomStartUrl;
        if (url) {
          window.open(url, '_blank');
        } else {
          this.showNotification('Lien hôte introuvable, essayez de redémarrer le rendez-vous', 'error');
        }
      },
      error: () => this.showNotification('Erreur lors de la récupération du lien hôte', 'error')
    });
  }
}

copyPatientLink(app: Appoitement): void {
  const joinUrl = (app as any).zoomJoinUrl
               || app.meetingUrl
               || app.zoomLink;

  if (joinUrl) {
    navigator.clipboard.writeText(joinUrl).then(() => {
      this.showNotification('Lien patient copié dans le presse-papier', 'success');
    });
  } else {
    this.showNotification('Lien patient introuvable', 'error');
  }
}

private startAppointmentAction(id: number, appointment: Appoitement): void {
  this.appointementService.startAppointment(id).subscribe({
    next: (response: AppointmentResponse) => {
      if (response.success) {
        const patientLink = response.joinUrl
                         || response.appointment?.zoomJoinUrl;

        const doctorLink  = (response as any).startUrl
                         || response.appointment?.zoomStartUrl
                         || patientLink;

        //  Stocker les deux URLs sur l'objet local pour usage ultérieur
        if (response.appointment) {
          (appointment as any).zoomStartUrl = response.appointment.zoomStartUrl
                                           || (response as any).startUrl;
          (appointment as any).zoomJoinUrl  = response.appointment.zoomJoinUrl
                                           || patientLink;
        }

        this.sendStartNotification(appointment, patientLink);
        this.showNotification('Réunion créée ! Vous pouvez maintenant la rejoindre.', 'success');
        this.getAppointment(); // ← recharge les données avec les URLs à jour

        if (doctorLink) {
          window.open(doctorLink, '_blank');
        }
      }
    },
    error: () => this.showNotification('Erreur lors du démarrage du rendez-vous', 'error')
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
      console.log(' Lien Zoom trouvé:', zoomLink);
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
    
    console.log(' Envoi notification de démarrage');
    console.log('  - userId:', userId);
    console.log('  - zoomLink param:', zoomLink);
    console.log('  - appointment.zoomJoinUrl:', (appointment as any).zoomJoinUrl);
    console.log('  - appointment.meetingUrl:', appointment.meetingUrl);
    
    // CORRECTION: Utiliser le lien Zoom du rendez-vous si pas fourni
    const finalZoomLink = zoomLink || (appointment as any).zoomJoinUrl || appointment.meetingUrl;
    
    if (userId) {
      this.notificationService.notifyUserAppointmentStarted(userId, appointment, finalZoomLink);
      console.log(` Notification de démarrage envoyée à l'utilisateur ${userId} avec lien: ${finalZoomLink}`);
    } else {
      this.notificationService.notifyUserAppointmentStarted(notifId, appointment, finalZoomLink);
      console.log(`⚠️ Notification de démarrage envoyée avec notifId ${notifId} avec lien: ${finalZoomLink}`);
    }
  }

  private getUserIdFromAppointment(appointment: Appoitement): number | null {
    // CORRECTION: Vérifier d'abord patientId (champ direct)
    if ((appointment as any).patientId && (appointment as any).patientId > 0) {
      console.log(' ID patient trouvé dans patientId:', (appointment as any).patientId);
      return (appointment as any).patientId;
    }
    
    // Fallback: Vérifier si patient existe et a un id
    if (appointment.patient && appointment.patient.id) {
      console.log(' ID patient trouvé dans l\'objet patient:', appointment.patient.id);
      return appointment.patient.id;
    }
    
    // Fallback: Utiliser l'ID de l'utilisateur connecté depuis le JWT
    const connectedUserId = this.jwtService.getUserId();
    if (connectedUserId && connectedUserId > 0) {
      console.log(' ID patient trouvé depuis JWT:', connectedUserId);
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
  
  private getStartDateTime(appointment: Appoitement): Date | null {
    try {
      let dateStr = '';
      let timeStr = '';
      
      // Priorité 1: Utiliser l'objet creneau
      if (appointment.creneau?.heureDebut && appointment.creneau?.date) {
        dateStr = appointment.creneau.date;
        timeStr = appointment.creneau.heureDebut;
      }
      // Priorité 2: Utiliser preferredDate et preferredTime
      else if (appointment.preferredDate && appointment.preferredTime) {
        dateStr = appointment.preferredDate;
        timeStr = appointment.preferredTime;
      }
      else {
        return null;
      }
      
      // Nettoyer l'heure (enlever les secondes)
      let cleanTime = timeStr;
      if (cleanTime.includes(':') && cleanTime.split(':').length === 3) {
        cleanTime = cleanTime.split(':').slice(0, 2).join(':');
      }
      
      return new Date(`${dateStr}T${cleanTime}:00`);
    } catch (error) {
      console.error('Erreur lors du parsing de la date de début:', error);
      return null;
    }
  }
  
  /**
   * Récupère l'heure de fin du rendez-vous
   */
  private getEndDateTime(appointment: Appoitement): Date | null {
    try {
      let dateStr = '';
      let timeStr = '';
      
      // Priorité 1: Utiliser l'heure de fin du créneau
      if (appointment.creneau?.heureFin && appointment.creneau?.date) {
        dateStr = appointment.creneau.date;
        timeStr = appointment.creneau.heureFin;
      }
      // Priorité 2: Utiliser preferredTime + durée (30 min par défaut)
      else if (appointment.preferredDate && appointment.preferredTime) {
        dateStr = appointment.preferredDate;
        timeStr = appointment.preferredTime;
        
        // Ajouter 30 minutes à l'heure de début
        const [hours, minutes] = timeStr.split(':').map(Number);
        const endDate = new Date(dateStr);
        endDate.setHours(hours, minutes + 30, 0, 0);
        return endDate;
      }
      else {
        return null;
      }
      
      // Nettoyer l'heure
      let cleanTime = timeStr;
      if (cleanTime.includes(':') && cleanTime.split(':').length === 3) {
        cleanTime = cleanTime.split(':').slice(0, 2).join(':');
      }
      
      return new Date(`${dateStr}T${cleanTime}:00`);
    } catch (error) {
      console.error('Erreur lors du parsing de la date de fin:', error);
      return null;
    }
  }
  
  /**
   * Vérifie si l'heure de début est atteinte ou dépassée
   */
  isStartTimeReached(appointment: Appoitement): boolean {
    const startDateTime = this.getStartDateTime(appointment);
    if (!startDateTime) return false;
    
    const now = new Date();
    return now >= startDateTime;
  }
  
  isEndTimePassed(appointment: Appoitement): boolean {
    const endDateTime = this.getEndDateTime(appointment);
    if (!endDateTime) return false;
    
    const now = new Date();
    return now >= endDateTime;
  }
  canStartAppointment(appointment: Appoitement): boolean {
    // Seuls les rendez-vous vidéo peuvent être démarrés
    if (appointment.appointmentType !== 'video') {
      return false;
    }
    
    if (appointment.status !== 'validated') {
      return false;
    }
    
    const startReached = this.isStartTimeReached(appointment);
    const endPassed = this.isEndTimePassed(appointment);
    
    return startReached && !endPassed;
  }
  
  isAppointmentInProgress(appointment: Appoitement): boolean {
    if (appointment.status !== 'started') {
      return false;
    }
    
    return !this.isEndTimePassed(appointment);
  }
  
  isAppointmentCompleted(appointment: Appoitement): boolean {
    // Si déjà marqué comme terminé
    if (appointment.status === 'completed') {
      return true;
    }
    
    // Si l'heure de fin est dépassée
    if (this.isEndTimePassed(appointment)) {
      // Si le rendez-vous était en cours, le marquer automatiquement comme terminé
      if (appointment.status === 'started') {
        this.completeAppointment(appointment.id);
      }
      return true;
    }
    
    return false;
  }
  
  private completeAppointment(id: number): void {
    console.log(`🏁 Marquage du rendez-vous ${id} comme terminé...`);
    
    this.appointementService.updateAppointmentStatus(id, 'completed').subscribe({
      next: (response) => {
        console.log(` Rendez-vous ${id} marqué comme terminé avec succès`);
        // Mettre à jour le statut dans le tableau local
        const appointment = this.tableauClasse.find(a => a.id === id);
        if (appointment) {
          appointment.status = 'completed';
        }
      },
      error: (error) => {
        console.error(`❌ Erreur lors du marquage du rendez-vous ${id}:`, error);
      }
    });
  }
  
  isStartButtonDisabled(appointment: Appoitement): boolean {
    return !this.canStartAppointment(appointment);
  }

  getStartButtonTooltip(appointment: Appoitement): string {
    if (appointment.appointmentType !== 'video') {
      return 'Rendez-vous présentiel - pas de téléconsultation';
    }
    
    if (appointment.status !== 'validated') {
      return `Rendez-vous ${this.getStatusLabel(appointment.status)} - non disponible`;
    }
    
    if (!this.isStartTimeReached(appointment)) {
      const timeLeft = this.getTimeUntilStart(appointment);
      return `Début dans ${timeLeft} (${this.getFormattedStartTime(appointment)})`;
    }
    
    if (this.isEndTimePassed(appointment)) {
      return 'Délai dépassé - Rendez-vous terminé';
    }
    
    return 'Démarrer la téléconsultation';
  }
  

  getAppointmentStatusMessage(appointment: Appoitement): string {
    if (appointment.status === 'completed') {
      return '✅ Terminé';
    }
    
    if (appointment.status === 'started') {
      if (this.isEndTimePassed(appointment)) {
        return '✅ Terminé';
      }
      return '🔵 En cours (visio)';
    }
    
    if (appointment.status === 'validated') {
      if (appointment.appointmentType === 'presential') {
        return '✅ Validé (présentiel)';
      }
      
      if (this.isEndTimePassed(appointment)) {
        return '⏰ Délai dépassé';
      }
      if (!this.isStartTimeReached(appointment)) {
        return `⏳ Début à ${this.getFormattedStartTime(appointment)}`;
      }
      return '🔘 Prêt à démarrer la visio';
    }
    
    if (appointment.status === 'pending') {
      return '⏳ En attente de validation';
    }
    
    if (appointment.status === 'rejected') {
      return '❌ Rejeté';
    }
    
    return this.getStatusLabel(appointment.status);
  }

  private getFormattedStartTime(appointment: Appoitement): string {
    const startDateTime = this.getStartDateTime(appointment);
    if (!startDateTime) return 'heure inconnue';
    
    return startDateTime.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  public getTimeUntilStart(appointment: Appoitement): string {
    const startDateTime = this.getStartDateTime(appointment);
    if (!startDateTime) return 'inconnu';
    
    const now = new Date();
    const diffMs = startDateTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'maintenant';
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    if (remainingMins === 0) return `${diffHours}h`;
    return `${diffHours}h${remainingMins}`;
  }
  public  getTimeUntilEnd(appointment: Appoitement): string {
    const endDateTime = this.getEndDateTime(appointment);
    if (!endDateTime) return 'inconnu';
    
    const now = new Date();
    const diffMs = endDateTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'terminé';
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h${diffMins % 60}min`;
  }
  
  startAutoRefresh(): void {
    setInterval(() => {
      this.checkAndUpdateAppointments();
    }, 60000); // Toutes les minutes
  }
  
  private checkAndUpdateAppointments(): void {
    if (!this.tableauClasse) return;
    
    let needsRefresh = false;
    
    this.tableauClasse.forEach(appointment => {
      // Si le rendez-vous est 'started' et l'heure de fin est dépassée
      if (appointment.status === 'started' && this.isEndTimePassed(appointment)) {
        console.log(`🏁 Rendez-vous ${appointment.id} terminé (heure de fin dépassée)`);
        this.completeAppointment(appointment.id);
        needsRefresh = true;
      }
    });
    
    // Rafraîchir l'affichage si nécessaire
    if (needsRefresh) {
      setTimeout(() => this.getAppointment(), 1000);
    }
  }


hasMedicalDocuments(appointment: Appoitement): boolean {
  return !!(appointment.medicalDocuments && 
            appointment.medicalDocuments !== 'Aucun' && 
            appointment.medicalDocuments !== 'Aucun document' &&
            appointment.medicalDocuments !== 'null' &&
            appointment.medicalDocuments !== '[]');
}


getDocumentsCount(appointment: Appoitement): number {
  if (!this.hasMedicalDocuments(appointment)) return 0;
  
  try {
    const docs = JSON.parse(appointment.medicalDocuments);
    if (Array.isArray(docs)) return docs.length;
    return 1;
  } catch (e) {
    return 1;
  }
}


voirDocumentsPatient(appointment: Appoitement): void {
  // Récupérer l'ID du patient
  const patientId = this.getUserIdFromAppointment(appointment);
  
  if (!patientId) {
    this.showNotification('Impossible d\'identifier le patient', 'error');
    return;
  }

  // Extraire les documents du rendez-vous
  const documents = this.extractDocuments(appointment);
  
  if (documents.length === 0) {
    this.showNotification('Aucun document médical pour ce patient', 'info');
    return;
  }

  // Afficher la modale avec les documents
  this.selectedPatientName = `${appointment.firstname} ${appointment.lastname}`;
  this.selectedPatientDocuments = documents;
  this.showDocumentsModal = true;
}

private extractDocuments(appointment: Appoitement): any[] {
  if (!appointment.medicalDocuments || 
      appointment.medicalDocuments === 'Aucun' || 
      appointment.medicalDocuments === 'Aucun document') {
    return [];
  }

  try {
    const parsed = JSON.parse(appointment.medicalDocuments);
    if (Array.isArray(parsed)) {
      return parsed;
    } else if (parsed && typeof parsed === 'object') {
      return [parsed];
    } else {
      return [{ name: 'Document', url: String(parsed), content: String(parsed) }];
    }
  } catch (e) {
    return [{
      name: 'Document médical',
      url: appointment.medicalDocuments,
      content: appointment.medicalDocuments
    }];
  }
}
closeDocumentsModal(): void {
  this.showDocumentsModal = false;
  this.selectedPatientDocuments = [];
  this.selectedPatientName = '';
}

openDocument(doc: any): void {
  let url = '';
  
  if (typeof doc === 'string') {
    url = doc;
  } else if (typeof doc === 'object') {
    url = doc.url || doc.content || doc.fileUrl || doc.data || '';
    
    // Si pas d'URL, chercher dans toutes les propriétés
    if (!url) {
      for (const key in doc) {
        if (typeof doc[key] === 'string' && 
            (doc[key].startsWith('http') || doc[key].startsWith('data:') || doc[key].startsWith('/'))) {
          url = doc[key];
          break;
        }
      }
    }
  }
  
  if (!url) {
    this.showNotification('Impossible d\'ouvrir le document', 'error');
    return;
  }
  
  window.open(url, '_blank');
}
isPresentialAppointment(appointment: Appoitement): boolean {
  return appointment.appointmentType === 'presential';
}
isVideoAppointment(appointment: Appoitement): boolean {
  return appointment.appointmentType === 'video';
}

// Obtenir l'icône du document
getDocumentIcon(doc: any): string {
  const url = this.getDocumentUrl(doc);
  if (!url) return '📄';
  
  if (url.includes('.pdf') || url.includes('application/pdf')) return '📑';
  if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png')) return '🖼️';
  if (url.includes('.doc') || url.includes('msword')) return '📝';
  if (url.startsWith('data:image')) return '🖼️';
  if (url.startsWith('data:application/pdf')) return '📑';
  
  return '📄';
}

// Obtenir le nom du document
getDocumentName(doc: any, index: number): string {
  if (typeof doc === 'string') {
    return `Document ${index + 1}`;
  }
  
  if (typeof doc === 'object') {
    return doc.name || doc.fileName || doc.title || doc.nom || `Document ${index + 1}`;
  }
  
  return `Document ${index + 1}`;
}

// Obtenir le type du document
getDocumentType(doc: any): string {
  const url = this.getDocumentUrl(doc);
  if (!url) return 'Type inconnu';
  
  if (url.includes('.pdf')) return 'PDF';
  if (url.includes('.jpg') || url.includes('.jpeg')) return 'Image JPEG';
  if (url.includes('.png')) return 'Image PNG';
  if (url.includes('.doc')) return 'Document Word';
  if (url.startsWith('data:image')) return 'Image';
  if (url.startsWith('data:application/pdf')) return 'PDF';
  
  return 'Document';
}

// Extraire l'URL du document
private getDocumentUrl(doc: any): string {
  if (!doc) return '';
  if (typeof doc === 'string') return doc;
  if (typeof doc === 'object') {
    return doc.url || doc.content || doc.fileUrl || doc.data || '';
  }
  return '';
}

}

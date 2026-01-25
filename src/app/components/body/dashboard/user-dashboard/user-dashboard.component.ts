import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { JwtService } from '../../../../_helps/jwt/jwt.service';
import { AppointComponent } from "../../appoint/appoint.component";
import { CommonModule } from '@angular/common';
import { ConseilComponent } from "../../conseil/conseil.component";
import { Appoitement } from '../../../../models/appoitement';
import { AppointementService } from '../../../../_helps/appointment/appointement.service';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../../_helps/notification.service';
import { Message } from '../../../../models/Message';
import { Creneau } from '../../../../models/Creneau';
import { CreneauService } from '../../../../_helps/Creneau/Creneau.service';
import { ZoomSimpleService } from '../../../../_helps/appointment/ZOOM/ZoomSimpleService';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [AppointComponent, CommonModule, ConseilComponent, RouterLink],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit, OnDestroy {
getStartButtonTooltip(_t179: Appoitement) {
throw new Error('Method not implemented.');
}
  //  Notifications en temps réel
  unreadMessagesCount: number = 0;
  showMessagesPanel: boolean = false;
  showMessageDetail: boolean = false;
  selectedMessage: Message | null = null;
  appointmentNotifications: Message[] = [];
  
  // Subscriptions
  private notificationsSubscription?: Subscription;
  private unreadCountSubscription?: Subscription;

  userName: string = '';
  menuOpen: boolean = false;
  tableauClasse: Appoitement[] = [];
  showMedicalFilePopup: boolean = false;
  selectedMedicalFile: any = null;
  activeSection: string = 'dashboard';
  creneauxDisponibles: Creneau[] = [];
  creneauxFiltres: Creneau[] = [];
  isLoadingCreneaux=false;
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'success';
  private processedAppointments: Set<string> = new Set();

  private refreshInterval: any;

  // Variables Zoom
  isZoomAuthenticated: boolean = false;
  zoomStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  zoomMeetingUrl: string | null = null;
  zoomMeetingPassword: string | null = null;
  currentZoomMeeting: any = null;

  medicalFiles = [
    {
      id: 1,
      icon: '📄',
      title: 'Analyse de sang',
      date: '25 avril 2025',
      location: 'BioMed Paris',
      type: 'Laboratoire',
      details: `
        <h3>Résultats d'analyse de sang</h3>
        <p><strong>Date du prélèvement :</strong> 25 avril 2025</p>
        <p><strong>Laboratoire :</strong> BioMed Paris</p>
        
        <h4>Hématologie</h4>
        <ul>
          <li><strong>Globules rouges :</strong> 4.5 M/µL (Norme : 4.5-5.5)</li>
          <li><strong>Hémoglobine :</strong> 14.2 g/dL (Norme : 13-17)</li>
          <li><strong>Globules blancs :</strong> 7200 /µL (Norme : 4000-10000)</li>
          <li><strong>Plaquettes :</strong> 250000 /µL (Norme : 150000-400000)</li>
        </ul>
        
        <h4>Biochimie</h4>
        <ul>
          <li><strong>Glycémie à jeun :</strong> 0.95 g/L (Norme : 0.70-1.10)</li>
          <li><strong>Cholestérol total :</strong> 1.85 g/L (Norme : < 2.00)</li>
          <li><strong>Créatinine :</strong> 9.5 mg/L (Norme : 7-13)</li>
        </ul>
        
        <p><strong>Conclusion :</strong> Résultats dans les normes. Aucune anomalie détectée.</p>
      `,
      fileUrl: '/assets/documents/analyse-sang-2025-04-25.pdf'
    },
    {
      id: 2,
      icon: '📄',
      title: 'Ordonnance médicale',
      date: '15 avril 2025',
      location: 'Dr. Martin',
      type: 'Médecin',
      details: `
        <h3>Ordonnance médicale</h3>
        <p><strong>Date :</strong> 15 avril 2025</p>
        <p><strong>Prescripteur :</strong> Dr. Martin, Médecin généraliste</p>
        
        <h4>Médicaments prescrits</h4>
        <ul>
          <li><strong>Doliprane 1000mg :</strong> 1 comprimé 3 fois par jour pendant 5 jours</li>
          <li><strong>Amoxicilline 500mg :</strong> 1 gélule 3 fois par jour pendant 7 jours</li>
          <li><strong>Vitamine C 500mg :</strong> 1 comprimé par jour pendant 1 mois</li>
        </ul>
        
        <h4>Recommandations</h4>
        <p>Repos conseillé pendant 48h. Boire beaucoup d'eau. Consulter si les symptômes persistent au-delà de 5 jours.</p>
        
        <p><strong>Renouvellement :</strong> Non renouvelable</p>
      `,
      fileUrl: '/assets/documents/ordonnance-2025-04-15.pdf'
    },
    {
      id: 3,
      icon: '📄',
      title: 'Radiographie pulmonaire',
      date: '10 mars 2025',
      location: 'Radiopole',
      type: 'Centre d\'imagerie',
      details: `
        <h3>Compte-rendu de radiographie pulmonaire</h3>
        <p><strong>Date de l'examen :</strong> 10 mars 2025</p>
        <p><strong>Centre d'imagerie :</strong> Radiopole</p>
        <p><strong>Radiologue :</strong> Dr. Dupont</p>
        
        <h4>Technique</h4>
        <p>Radiographie thoracique de face et de profil</p>
        
        <h4>Résultats</h4>
        <ul>
          <li><strong>Champs pulmonaires :</strong> Clairs et bien aérés</li>
          <li><strong>Structures médiastinales :</strong> Normales</li>
          <li><strong>Cœur :</strong> Taille et forme normales</li>
          <li><strong>Coupoles diaphragmatiques :</strong> Régulières</li>
          <li><strong>Paroi thoracique :</strong> Sans anomalie</li>
        </ul>
        
        <h4>Conclusion</h4>
        <p>Radiographie thoracique sans anomalie décelable. Pas d'image pathologique pulmonaire.</p>
      `,
      fileUrl: '/assets/documents/radio-pulmonaire-2025-03-10.pdf'
    },
    {
      id: 4,
      icon: '📄',
      title: 'Compte-rendu ophtalmologique',
      date: '3 mars 2025',
      location: 'Dr. Petit',
      type: 'Médecin',
      details: `
        <h3>Compte-rendu ophtalmologique</h3>
        <p><strong>Date :</strong> 3 mars 2025</p>
        <p><strong>Ophtalmologiste :</strong> Dr. Petit</p>
        
        <h4>Motif de consultation</h4>
        <p>Contrôle annuel de la vue</p>
        
        <h4>Examen de la vue</h4>
        <ul>
          <li><strong>Œil droit :</strong> Acuité visuelle 10/10</li>
          <li><strong>Œil gauche :</strong> Acuité visuelle 10/10</li>
          <li><strong>Vision binoculaire :</strong> Normale</li>
          <li><strong>Pression intraoculaire :</strong> OD: 15 mmHg, OG: 14 mmHg (Normal)</li>
        </ul>
        
        <h4>Fond d'œil</h4>
        <p>Rétine saine, pas de signe de pathologie rétinienne. Nerf optique normal.</p>
        
        <h4>Conclusion</h4>
        <p>Examen ophtalmologique normal. Vision excellente. Contrôle recommandé dans 1 an.</p>
      `,
      fileUrl: '/assets/documents/ophtalmo-2025-03-03.pdf'
    }
  ];
  meetingJoinUrl: any;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private jwtService: JwtService,
    private cdr: ChangeDetectorRef,
    private creneauService: CreneauService,
    private appointementService: AppointementService,
    private zoomService: ZoomSimpleService,
  ) {}

  ngOnInit(): void {
    this.loadUserName();
    this.loadUserAppointments();
    this.subscribeToNotifications();
    this.checkZoomAuthentication(); // Nouveau: Vérifier l'authentification Zoom
    
    //  Polling pour vérifier les mises à jour toutes les 10 secondes
    setInterval(() => {
      this.loadUserAppointments();
    }, 10000);

    //  Forcer la détection de changements toutes les 30 secondes
    // Pour mettre à jour l'état des boutons en temps réel
    this.refreshInterval = setInterval(() => {
      this.cdr.detectChanges();
    }, 30000); // 30 secondes
  }

  ngOnDestroy(): void {
    //  Nettoyer les subscriptions
    this.notificationsSubscription?.unsubscribe();
    this.unreadCountSubscription?.unsubscribe();
  }

  // ==================== MÉTHODES ZOOM (NOUVELLES) ====================

  /**
   * Vérifier l'authentification Zoom
   */
  checkZoomAuthentication(): void {
    this.zoomStatus = 'connecting';
    this.zoomService.isZoomAuthenticated().subscribe({
      next: (authenticated) => {
        this.isZoomAuthenticated = authenticated;
        this.zoomStatus = authenticated ? 'connected' : 'disconnected';
        this.cdr.detectChanges();
      },
      error: () => {
        this.zoomStatus = 'disconnected';
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Connecter à Zoom
   */
  connectZoom(): void {
    this.zoomStatus = 'connecting';
    window.open(this.zoomService.getZoomAuthUrl(), '_blank');
    
    // Vérifier après 3 secondes
    setTimeout(() => {
      this.checkZoomAuthentication();
    }, 3000);
  }

  /**
   * Rafraîchir le token Zoom
   */
  refreshZoomToken(): void {
    this.zoomStatus = 'connecting';
    this.zoomService.refreshZoomToken().subscribe({
      next: () => {
        this.showNotification('Token Zoom rafraîchi', 'success');
        this.checkZoomAuthentication();
      },
      error: () => {
        this.zoomStatus = 'disconnected';
        this.showNotification('Échec du rafraîchissement', 'error');
      }
    });
  }

  /**
   * Démarrer une téléconsultation avec Zoom
   */
  startTeleconsultation(appointment: Appoitement): void {
    if (!this.isStatusValidated(appointment.status)) {
      this.showNotification('Le rendez-vous doit être validé pour pouvoir commencer', 'error');
      return;
    }

    // Vérifier que le rendez-vous n'est pas déjà démarré
    if (appointment.status === 'started') {
      this.showNotification('Le rendez-vous est déjà en cours', 'info');
      return;
    }

    // Vérifier l'authentification Zoom
    if (!this.isZoomAuthenticated) {
      this.showNotification(
        'Zoom n\'est pas configuré. Veuillez contacter l\'administrateur.',
        'error'
      );
      return;
    }

    this.zoomStatus = 'connecting';
    this.showNotification('Création de la réunion Zoom...', 'info');

    const topic = `Consultation - ${appointment.firstname} ${appointment.lastname} - ${appointment.reason || 'Consultation médicale'}`;

    // Choisir entre réunion instantanée ou planifiée
    const createMeeting$ = this.isAppointmentTimeReached(appointment) 
      ? this.zoomService.createInstantMeeting(topic)
      : this.zoomService.createScheduledMeeting(
          topic,
          this.convertToISOFormat(appointment.preferredDate, appointment.preferredTime),
          60
        );

    createMeeting$.subscribe({
      next: (meeting) => {
        console.log('✅ Réunion Zoom créée:', meeting);
        
        // Sauvegarder le lien dans le rendez-vous
        appointment.meetingUrl = meeting.join_url;
        this.currentZoomMeeting = meeting;
        
        // Mettre à jour le statut du rendez-vous
        this.updateAppointmentWithZoom(appointment, meeting);
        
        // Ouvrir la réunion Zoom
        this.openZoomMeeting(meeting);
      },
      error: (error) => {
        console.error('❌ Erreur création Zoom:', error);
        this.zoomStatus = 'connected';
        this.showNotification(
          'Échec de la création de la réunion Zoom. Veuillez réessayer.',
          'error'
        );
      }
    });
  }

  /**
   * Mettre à jour le rendez-vous avec les infos Zoom
   */
  private updateAppointmentWithZoom(appointment: Appoitement, meeting: any): void {
    const updatedData = {
      status: 'started',
      meetingUrl: meeting.join_url,
      zoomMeetingId: meeting.id,
      zoomStartUrl: meeting.start_url,
      zoomPassword: meeting.password
    };

    this.updateAppointment(appointment.id, updatedData as Partial<Appoitement>);
  }

  /**
   * Ouvrir la réunion Zoom
   */
  private openZoomMeeting(meeting: any): void {
    this.zoomService.openZoomMeeting(meeting.join_url);
    this.zoomStatus = 'connected';
    
    // Afficher les détails de la réunion
    this.zoomMeetingUrl = meeting.join_url;
    this.zoomMeetingPassword = meeting.password || null;
    
    this.showNotification('Réunion Zoom démarrée avec succès!', 'success');
    
    // Instructions
    setTimeout(() => {
      this.showNotification(
        `Si Zoom ne s'ouvre pas automatiquement, cliquez sur: ${meeting.join_url}`,
        'info'
      );
    }, 2000);
  }

  /**
   * Rejoindre une réunion Zoom existante
   */
  joinExistingZoomMeeting(appointment: Appoitement): void {
    if (appointment.meetingUrl) {
      this.zoomService.openZoomMeeting(appointment.meetingUrl);
      this.showNotification('Connexion à la réunion Zoom...', 'info');
    } else {
      this.showNotification('Aucun lien de réunion disponible', 'error');
    }
  }

  /**
   * Copier le lien Zoom dans le presse-papier
   */
  copyZoomLink(): void {
    if (this.zoomMeetingUrl) {
      navigator.clipboard.writeText(this.zoomMeetingUrl).then(
        () => this.showNotification('Lien copié dans le presse-papier', 'success'),
        () => this.showNotification('Échec de la copie', 'error')
      );
    }
  }


  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(
      () => this.showNotification('Copié dans le presse-papier', 'success'),
      (err) => {
        console.error('Erreur copie:', err);
        this.showNotification('Échec de la copie', 'error');
      }
    );
  }

  /**
   * Obtenir l'état du bouton Zoom
   */
  getZoomButtonState(appointment: Appoitement): string {
    if (!this.canStartAppointment(appointment)) {
      return 'disabled';
    }
    if (!this.isZoomAuthenticated) {
      return 'not-configured';
    }
    return 'ready';
  }

  /**
   * Obtenir le texte du tooltip pour le bouton Zoom
   */
  getZoomButtonTooltip(appointment: Appoitement): string {
    if (!this.canStartAppointment(appointment)) {
      return 'Le rendez-vous ne peut pas encore commencer';
    }
    if (!this.isZoomAuthenticated) {
      return 'Zoom doit être configuré par l\'administrateur';
    }
    return 'Cliquez pour démarrer la téléconsultation Zoom';
  }

  // ==================== MÉTHODES EXISTANTES (NON MODIFIÉES) ====================

  //  S'abonner au service de notifications
  subscribeToNotifications(): void {
    this.notificationsSubscription = this.notificationService.notifications$.subscribe(
      (notifications: Message[]) => {
        this.appointmentNotifications = notifications;
        console.log('📬 Notifications mises à jour:', notifications);
        this.cdr.detectChanges();
      }
    );
  
    this.unreadCountSubscription = this.notificationService.unreadCount$.subscribe(
      (count: number) => {
        this.unreadMessagesCount = count;
        console.log('🔢 Messages non lus:', count);
        this.cdr.detectChanges();
      }
    );
  }
  

  loadUserName(): void {
    const decodedToken = this.jwtService.getDecodedToken();
    this.userName = this.jwtService.getUserName() || '';
    
    if (this.userName.includes('@')) {
      this.userName = this.userName.split('@')[0];
    }
  }

  loadUserAppointments(): void {
    this.appointementService.getAllAppointment().subscribe({
      next: (data) => {
        const oldAppointments = [...this.tableauClasse];
        this.tableauClasse = data;
        
        // Détecter les changements si ce n'est pas le premier chargement
        if (oldAppointments.length > 0) {
          this.detectStatusChanges(oldAppointments, data);
        }
      },
      error: (error) => {
        console.error("❌ Erreur lors du chargement des rendez-vous :", error);
      }
    });
  }

  // ✅ Détecter les changements de statut et créer des notifications
  detectStatusChanges(oldList: Appoitement[], newList: Appoitement[]): void {
    newList.forEach(newApp => {
      const oldApp = oldList.find(old => old.id === newApp.id);
      
      if (oldApp && oldApp.status !== newApp.status) {
        console.log(`🔔 Changement détecté pour RDV #${newApp.id}: ${oldApp.status} → ${newApp.status}`);
        
        // Créer la notification appropriée selon le nouveau statut
        switch (newApp.status) {
          case 'validated':
            this.notificationService.notifyAppointmentValidated(newApp);
            this.showNotification('✅ Votre rendez-vous a été validé !', 'success');
            break;
            
          case 'rejected':
            this.notificationService.notifyAppointmentRejected(newApp);
            this.showNotification('❌ Votre rendez-vous a été rejeté', 'info');
            break;
            
          case 'started':
            this.notificationService.notifyAppointmentStarted(newApp);
            this.showNotification('🏥 Votre rendez-vous a débuté', 'info');
            break;
        }
      }
    });
  }

  // ✅ Gestion du panneau de messages
  toggleMessagesPanel(): void {
    this.showMessagesPanel = !this.showMessagesPanel;
    if (this.showMessagesPanel) {
      this.showMessageDetail = false;
    }
  }

  openMessage(notification: Message): void {
    this.selectedMessage = notification;
    this.showMessageDetail = true;
    
    if (notification.read) {
      this.notificationService.markAsRead(notification.id);
    }
  }

  closeMessageDetail(): void {
    this.showMessageDetail = false;
    this.selectedMessage = null;
  }

  deleteMessage(notificationId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      this.notificationService.deleteNotification(notificationId);
      
      if (this.selectedMessage?.id === notificationId) {
        this.closeMessageDetail();
      }
      
      this.showNotification('Notification supprimée avec succès', 'success');
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
    this.showNotification('Toutes les notifications ont été marquées comme lues', 'success');
  }

  getMessageIcon(type: string): string {
    const icons: any = {
      'info': 'ℹ️',
      'success': '✅',
      'alert': '⚠️',
      'error': '❌'
    };
    return icons[type] || '📧';
  }

  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }

  hideNotification(): void {
    this.showAlert = false;
  }

  // Gestion des sections
  showSection(section: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.activeSection = section;
    this.cdr.detectChanges();
  }

  isSectionActive(section: string): boolean {
    return this.activeSection === section;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.cdr.detectChanges();
  }

  logout(): void {
    this.jwtService.removeToken();
    this.userName = '';
    this.menuOpen = false;
    this.router.navigateByUrl('/');
  }

  openMedicalFile(fileId: number): void {
    const file = this.medicalFiles.find(f => f.id === fileId);
    if (file) {
      this.selectedMedicalFile = file;
      this.showMedicalFilePopup = true;
      this.cdr.detectChanges();
    }
  }

  closeMedicalFilePopup(): void {
    this.showMedicalFilePopup = false;
    this.selectedMedicalFile = null;
    this.cdr.detectChanges();
  }

  downloadMedicalFile(fileUrl: string, fileName: string): void {
    window.open(fileUrl, '_blank');
    alert(`Téléchargement de ${fileName} en cours...`);
  }

  printMedicalFile(): void {
    if (this.selectedMedicalFile) {
      window.print();
    }
  }

  downloadCompleteMedicalFile(): void {
    alert('Téléchargement du dossier médical complet en cours...\nCela peut prendre quelques instants.');
  }

  deleteAppointement(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      this.appointementService.deleteAppointment(id).subscribe({
        next: () => {
          this.showNotification('Rendez-vous annulé avec succès', 'success');
          this.loadUserAppointments();
        },
        error: (error) => {
          console.error("❌ Erreur lors de l'annulation :", error);
          this.showNotification('Erreur lors de l\'annulation', 'error');
        }
      });
    }
  }

  updateAppointment(id: number, updatedData: Partial<Appoitement>): void {
    this.appointementService.updateAppointment(id, updatedData as Appoitement).subscribe({
      next: () => {
        this.showNotification('Rendez-vous mis à jour avec succès', 'success');
        this.loadUserAppointments();
      },
      error: (error) => {
        console.error("❌ Erreur lors de la mise à jour :", error);
        this.showNotification('Erreur lors de la mise à jour', 'error');
      }
    });
  }

  chargerCreneauxDuMedecin(doctorId: number): void {
    this.isLoadingCreneaux = true;
 
    // Option 2: Récupérer tous les créneaux disponibles et filtrer
    this.creneauService.getCreneauxDocteur(doctorId).subscribe({
      next: (creneaux: Creneau[]) => {
        // Filtrer uniquement les créneaux disponibles et futurs
        const aujourdhui = new Date();
        aujourdhui.setHours(0, 0, 0, 0);
        
        this.creneauxDisponibles = creneaux.filter(c => 
          c.disponible && 
          new Date(c.date) >= aujourdhui
        );
        
        this.creneauxFiltres = [...this.creneauxDisponibles];
        this.isLoadingCreneaux = false;
        console.log('Créneaux chargés:', this.creneauxDisponibles);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des créneaux:', error);
        this.isLoadingCreneaux = false;
        alert('Erreur lors du chargement des créneaux disponibles');
      }
    });
  }

  // Filtrer les créneaux par date
  filtrerCreneauxParDate(date: string): void {
    if (!date) {
      this.creneauxFiltres = [...this.creneauxDisponibles];
      return;
    }

    this.creneauxFiltres = this.creneauxDisponibles.filter(c => c.date === date);
  }

  // Grouper les créneaux par date pour un meilleur affichage
  getCreneauxGroupesParDate(): { date: string; creneaux: Creneau[] }[] {
    const groupes = new Map<string, Creneau[]>();

    this.creneauxFiltres.forEach(creneau => {
      if (!groupes.has(creneau.date)) {
        groupes.set(creneau.date, []);
      }
      groupes.get(creneau.date)?.push(creneau);
    });

    // Convertir en tableau et trier par date
    return Array.from(groupes.entries())
      .map(([date, creneaux]) => ({
        date,
        creneaux: creneaux.sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Formater la date pour l'affichage
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Formater l'heure
  formatHeure(heureStr: string): string {
    return heureStr.substring(0, 5);
  }

  // ========== FONCTIONS DE VÉRIFICATION DU STATUT ET DE L'HEURE ==========

  // ✅ Vérifier si le statut est "validé"
  isStatusValidated(status: string): boolean {
    if (!status) return false;
    
    const normalizedStatus = status.toLowerCase().trim();
    return normalizedStatus === 'validated' || 
           normalizedStatus === 'validé' || 
           normalizedStatus === 'valide';
  }
  
  // ✅ Vérifier si l'heure du rendez-vous est arrivée
  isAppointmentTimeReached(appointment: Appoitement): boolean {
    if (!appointment.preferredDate || !appointment.preferredTime) {
      return false;
    }
  
    try {
      // Créer l'objet Date du rendez-vous
      const appointmentDateTime = this.parseAppointmentDateTime(
        appointment.preferredDate, 
        appointment.preferredTime
      );
      
      // Comparer avec l'heure actuelle
      const now = new Date();
      
      // Le rendez-vous peut commencer 5 minutes avant l'heure prévue
      const bufferTime = 5 * 60 * 1000; // 5 minutes en millisecondes
      
      return now.getTime() >= (appointmentDateTime.getTime() - bufferTime);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'heure:', error);
      return false;
    }
  }
  
  //  Parser la date et l'heure du rendez-vous
  private parseAppointmentDateTime(dateStr: string, timeStr: string): Date {
    // Gérer différents formats de date
    let date: Date;
    
    // Format ISO: "2025-01-16"
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } 
    // Format français: "16/01/2025"
    else if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(Number);
      date = new Date(year, month - 1, day);
    } 
    // Autre format
    else {
      date = new Date(dateStr);
    }
    
    // Gérer l'heure: "14:30" ou "14:30:00"
    const timeParts = timeStr.split(':').map(Number);
    const hours = timeParts[0];
    const minutes = timeParts[1] || 0;
    
    date.setHours(hours, minutes, 0, 0);
    
    return date;
  }
  
  //  Vérifier si on peut démarrer le rendez-vous
  canStartAppointment(appointment: Appoitement): boolean {
    // Conditions:
    // 1. Le rendez-vous doit être validé
    // 2. L'heure doit être arrivée
    // 3. Le rendez-vous ne doit pas déjà être démarré
    return this.isStatusValidated(appointment.status) && 
           this.isAppointmentTimeReached(appointment) &&
           appointment.status !== 'started';
  }
  
  // ✅ Obtenir le temps restant avant le rendez-vous
  getTimeUntilAppointment(appointment: Appoitement): string {
    if (!appointment.preferredDate || !appointment.preferredTime) {
      return '';
    }
  
    try {
      const appointmentDateTime = this.parseAppointmentDateTime(
        appointment.preferredDate, 
        appointment.preferredTime
      );
      const now = new Date();
      const diffMs = appointmentDateTime.getTime() - now.getTime();
  
      // Si le rendez-vous est déjà passé ou maintenant
      if (diffMs <= 0) {
        return 'Le rendez-vous peut commencer';
      }
  
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const remainingMinutes = diffMinutes % 60;
      const diffDays = Math.floor(diffHours / 24);
  
      if (diffDays > 0) {
        return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
      } else if (diffHours > 0) {
        if (remainingMinutes > 0) {
          return `Dans ${diffHours}h ${remainingMinutes}min`;
        }
        return `Dans ${diffHours}h`;
      } else {
        return `Dans ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
      }
    } catch (error) {
      console.error('Erreur calcul temps:', error);
      return '';
    }
  }
  
  //  Obtenir la classe CSS du statut
  getStatusClass(status: string): string {
    if (!status) return 'status-default';
    
    const normalizedStatus = status.toLowerCase().trim();
    
    switch (normalizedStatus) {
      case 'validated':
      case 'validé':
      case 'valide':
        return 'status-validated';
        
      case 'pending':
      case 'en attente':
        return 'status-pending';
        
      case 'started':
      case 'démarré':
      case 'en cours':
        return 'status-started';
        
      case 'rejected':
      case 'cancelled':
      case 'annulé':
      case 'refusé':
        return 'status-rejected';
        
      case 'validated':
      case 'terminé':
        return 'status-validated';
        
      default:
        return 'status-default';
    }
  }
  
  //  Obtenir le libellé du statut avec emoji
  getStatusLabel(status: string): string {
    if (!status) return 'Non défini';
    
    const normalizedStatus = status.toLowerCase().trim();
    
    const labels: { [key: string]: string } = {
      'validated': 'Validé ',
      'validé': 'Validé ',
      'valide': 'Validé ',
      
      'pending': 'En attente ',
      'en attente': 'En attente ',
      
      'started': 'En cours ',
      'démarré': 'En cours ',
      'en cours': 'En cours ',
      
      'rejected': 'rejecter ',
      'cancelled': 'Annulé ',
      'annulé': 'Annulé ',
      'refusé': 'Refusé ',
      
      'completed': 'Terminé ',
      'terminé': 'Terminé '
    };
    
    return labels[normalizedStatus] || status;
  }
  
  // Formater la date pour l'affichage
  formatAppointmentDate(dateStr: string): string {
    try {
      let date: Date;
      
      if (dateStr.includes('-')) {
        date = new Date(dateStr);
      } else if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        date = new Date(`${year}-${month}-${day}`);
      } else {
        date = new Date(dateStr);
      }
      
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateStr;
    }
  }
  
  //  Formater l'heure pour l'affichage
  formatAppointmentTime(timeStr: string): string {
    if (!timeStr) return '';
    
    // Si déjà au bon format (HH:mm), retourner tel quel
    if (timeStr.match(/^\d{2}:\d{2}$/)) {
      return timeStr;
    }
    
    // Si format avec secondes (HH:mm:ss), enlever les secondes
    if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return timeStr.substring(0, 5);
    }
    
    return timeStr;
  }

  // Si vous voulez créer une réunion planifiée:
  createScheduledZoomMeeting(appointment: Appoitement): void {
    const topic = `Consultation - ${appointment.firstname} ${appointment.lastname}`;
    
    // Convertir la date/heure du rendez-vous au format ISO
    const startTime = this.convertToISOFormat(appointment.preferredDate, appointment.preferredTime);
    
    this.zoomService.createScheduledMeeting(topic, startTime, 60).subscribe({
      next: (meeting) => {
        console.log('✅ Réunion planifiée:', meeting);
        
        // Sauvegarder le lien dans le rendez-vous
        appointment.meetingUrl = meeting.join_url;
        
        // Mettre à jour le rendez-vous dans la base de données
        this.updateAppointment(appointment.id, { meetingUrl: meeting.join_url } as Partial<Appoitement>);
        
        this.showNotification('Lien Zoom généré avec succès !', 'success');
      },
      error: (error) => {
        console.error('❌ Erreur:', error);
        this.showNotification('Erreur lors de la création du lien Zoom', 'error');
      }
    });
  }
  
  // Fonction utilitaire pour convertir date/heure en ISO
  private convertToISOFormat(dateStr: string, timeStr: string): string {
    let date: Date;
    // Format ISO: "2025-01-16"
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } 
    // Format français: "16/01/2025"
    else if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(Number);
      date = new Date(year, month - 1, day);
    } 
    else {
      date = new Date(dateStr);
    }
    const timeParts = timeStr.split(':').map(Number);
    date.setHours(timeParts[0], timeParts[1] || 0, 0, 0);
    
    return date.toISOString();
  }




}
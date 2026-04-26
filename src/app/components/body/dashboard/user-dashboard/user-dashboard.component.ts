import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { JwtService } from '../../../../_helps/jwt/jwt.service';
import { AppointComponent } from '../../appoint/appoint.component';
import { CommonModule } from '@angular/common';
import { ConseilComponent } from '../doc-dashboard/conseil/conseil.component';
import { Appoitement } from '../../../../models/appoitement';
import { AppointementService } from '../../../../_helps/appointment/appointement.service';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../../_helps/notification.service';
import { Message } from '../../../../models/Message';
import { Creneau } from '../../../../models/Creneau';
import { CreneauService } from '../../../../_helps/Creneau/Creneau.service';
import { DocumentService } from '../../../../_helps/Documents/DocumentService .service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [AppointComponent, CommonModule, ConseilComponent, RouterLink],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  getStartButtonTooltip(appointment: Appoitement): string {
    const meetingUrl =
      appointment.meetingUrl ||
      appointment.zoomLink ||
      (appointment as any).zoomJoinUrl;

    if (appointment.status === 'started' && meetingUrl)
      return 'Rejoindre la téléconsultation';
    if (appointment.status === 'started')
      return 'Téléconsultation démarrée (lien indisponible)';
    if (!this.isStatusValidated(appointment.status))
      return 'Le rendez-vous doit être validé';
    return 'En attente que le médecin démarre la téléconsultation';
  }

  // ── Notifications en temps réel ──────────────────────────────
  unreadMessagesCount: number = 0;
  showMessagesPanel: boolean = false;
  showMessageDetail: boolean = false;
  selectedMessage: Message | null = null;
  appointmentNotifications: Message[] = [];
  showLogoutModal = false;
  menuOpen = false;

  // ── Subscriptions ────────────────────────────────────────────
  private notificationsSubscription?: Subscription;
  private unreadCountSubscription?: Subscription;

  userName: string = '';
  tableauClasse: Appoitement[] = [];
  showMedicalFilePopup: boolean = false;
  selectedMedicalFile: any = null;
  activeSection: string = 'dashboard';
  creneauxDisponibles: Creneau[] = [];
  creneauxFiltres: Creneau[] = [];
  isLoadingCreneaux = false;
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'success';
  userId: number | null = null;
  // ── Cards dynamiques ─────────────────────────────────────────
  prochainRdv: Appoitement | null = null;
  rdvValides: number = 0;
  rdvEnAttente: number = 0;
  rdvTermines: number = 0;
  rdvVideo: number=0 ;
  rdvPresential: number = 0;
  private loadInterval: any;
  // Ajoutez dans la classe

  medicalDocuments: any[] = [];          
  isLoadingDocuments: boolean = false;    
  patientDocuments: any[] = [];           
  totalDocumentsCount: number = 0;        
  realMedicalDocuments: any[] = []; 

  // ── Données du graphe ────────────────────────────────────────

  statsGraphe: {
    label: string;
    value: number;
    height: number;
    color: string;
  }[] = [];


  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private jwtService: JwtService,
    private cdr: ChangeDetectorRef,
    private creneauService: CreneauService,
    private appointementService: AppointementService,
    private documentService:DocumentService,
  ) {}

  ngOnInit(): void {
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    this.loadInterval = setInterval(() => this.loadUserAppointments(), 10000);
    this.loadUserName();
    this.loadUserAppointments();
    this.notificationService.connect();
    this.subscribeToNotifications();
    this.loadMedicalDocuments(); 
    this.startAppointmentWatcher();
  }

  ngOnDestroy(): void {
    clearInterval(this.loadInterval);
    this.notificationsSubscription?.unsubscribe();
    this.unreadCountSubscription?.unsubscribe();
  }

  openLogoutModal() {
    console.log('CLICK OK');
    this.menuOpen = false; // ferme le dropdown
    this.showLogoutModal = true;
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }
  @HostListener('document:click')
  onDocumentClick() {
    if (this.menuOpen) {
      this.menuOpen = false;
      this.cdr.detectChanges();
    }
  }
  copyToClipboard(text?: string | null): void {
    if (!text) {
      this.showNotification('Aucun contenu à copier', 'error');
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => this.showNotification('Copié dans le presse-papier', 'success'),
      (err) => {
        console.error('Erreur copie:', err);
        this.showNotification('Échec de la copie', 'error');
      },
    );
  }
  subscribeToNotifications(): void {
    const userId = this.jwtService.getUserId();

    if (!userId) {
      console.error(
        "Utilisateur non connecté - impossible de s'abonner aux notifications",
      );
      return;
    }

    this.notificationsSubscription = this.notificationService
      .getUserNotifications$(userId)
      .subscribe((userNotifications: Message[]) => {
        this.appointmentNotifications = userNotifications;
        console.log(
          `${userNotifications.length} notifications pour l'utilisateur ${userId}`,
        );
        this.cdr.detectChanges();
      });

    this.unreadCountSubscription =
      this.notificationService.unreadCount$.subscribe((count: number = 0) => {
        this.unreadMessagesCount = count;
        console.log('Messages non lus:', count);
        this.cdr.detectChanges();
      });
  }

  private filterUserNotifications(allNotifications: Message[]): Message[] {
    const userId = this.jwtService.getUserId();
    if (!userId) return allNotifications;
    return allNotifications.filter((notification) =>
      this.isNotificationForUser(notification, userId),
    );
  }

  private isNotificationForUser(
    notification: Message,
    userId: number,
  ): boolean {
    if (notification.appointmentId) {
      return this.isUserAppointment(notification.appointmentId, userId);
    }
    const userIdentifier = this.getUserIdentifier();
    if (userIdentifier && notification.content) {
      return notification.content
        .toLowerCase()
        .includes(userIdentifier.toLowerCase());
    }
    return true;
  }

  private isUserAppointment(appointmentId: number, userId: number): boolean {
    return this.tableauClasse.some(
      (appointment) => appointment.id === appointmentId,
    );
  }

  private getUserIdentifier(): string | null {
    return this.jwtService.getEmail() || this.jwtService.getUserName();
  }

  resetNotis(): void {
    this.unreadMessagesCount = 0;
    this.notificationService.resetNotis?.();
  }

  toggleMessagesPanel(): void {
    this.showMessagesPanel = !this.showMessagesPanel;
    if (this.showMessagesPanel) {
      this.showMessageDetail = false;
    }
  }

  openMessage(notification: Message): void {
    this.selectedMessage = notification;
    this.showMessageDetail = true;
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id);
    }
  }

  closeMessageDetail(): void {
    this.showMessageDetail = false;
    this.selectedMessage = null;
  }

  deleteMessage(notificationId: number, event?: Event): void {
    if (event) event.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      this.notificationService.deleteNotification(notificationId);
      if (this.selectedMessage?.id === notificationId) {
        this.closeMessageDetail();
      }
      this.showNotification('Notification supprimée avec succès', 'success');
    }
  }

  markAllAsRead(): void {
    const userId = this.jwtService.getUserId();
    if (!userId) {
      this.showNotification('Utilisateur non connecté', 'error');
      return;
    }
    this.notificationService.markAllAsReadForUser(userId);
    this.resetNotis();

    this.showNotification(
      'Toutes les notifications ont été marquées comme lues',
      'success',
    );
  }

  getMessageIcon(type: string): string {
    const icons: Record<string, string> = {
      info: 'ℹ️',
      success: '',
      alert: '⚠️',
      error: '❌',
    };
    return icons[type] || '📧';
  }

  loadUserName(): void {
    this.userName = this.jwtService.getUserName() || '';
    if (this.userName.includes('@')) {
      this.userName = this.userName.split('@')[0];
    }
  }



  calculerStatistiques(): void {
    const now = new Date();

    this.rdvValides = this.tableauClasse.filter(
      (a) => a.status === 'validated'
    ).length;

    this.rdvEnAttente = this.tableauClasse.filter(
      (a) => a.status === 'pending'
    ).length;
    this.rdvTermines = this.tableauClasse.filter(
      (a) => a.status === 'completed'
    ).length;
    const rdvRejetes = this.tableauClasse.filter(
      (a) => a.status === 'rejected'
    ).length;
  
   
    this.rdvVideo = this.tableauClasse.filter(
      (a) => a.appointmentType === 'video'
    ).length;
    this.rdvPresential = this.tableauClasse.filter(
      (a) => a.appointmentType === 'presential'
    ).length;

    const rdvFuturs = [...this.tableauClasse]
      .filter((a) => {
        if (!a.preferredDate || !a.preferredTime) return false;
        try {
          const dateRdv = this.buildDate(a.preferredDate, a.preferredTime);
          const now = new Date();
  
          const statutActif = a.status === 'validated' || a.status === 'pending';
          return dateRdv >= now && statutActif;
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        const da = this.buildDate(a.preferredDate, a.preferredTime);
        const db = this.buildDate(b.preferredDate, b.preferredTime);
        return da.getTime() - db.getTime();
      });
  
    this.prochainRdv = rdvFuturs.length > 0 ? rdvFuturs[0] : null;
  
    // CORRECTION: Graphique avec les bonnes valeurs
    const rawValues = [
      { label: 'Total', value: this.tableauClasse.length, color: '#3F80F0' },
      { label: 'Validés', value: this.rdvValides, color: '#12A05A' },
      { label: 'Attente', value: this.rdvEnAttente, color: '#F59E0B' },
      { label: 'Rejetés', value: rdvRejetes, color: '#F43F5E' },
      { label: 'Vidéo', value: this.rdvVideo, color: '#0FA7A0' },
    ];
  
    const maxVal = Math.max(...rawValues.map((s) => s.value), 1);
    const MAX_HEIGHT = 80;
    const MIN_HEIGHT = 6;
  
    this.statsGraphe = rawValues.map((s) => ({
      ...s,
      height: s.value === 0
        ? MIN_HEIGHT
        : Math.max(MIN_HEIGHT, Math.round((s.value / maxVal) * MAX_HEIGHT)),
    }));
  

  }

  buildDate(dateStr: string, timeStr: string): Date {
    let date: Date;
    if (dateStr.includes('-')) {
      const [y, m, d] = dateStr.split('-').map(Number);
      date = new Date(y, m - 1, d);
    } else if (dateStr.includes('/')) {
      const [d, m, y] = dateStr.split('/').map(Number);
      date = new Date(y, m - 1, d);
    } else {
      date = new Date(dateStr);
    }
    const [h, min] = timeStr.split(':').map(Number);
    date.setHours(h, min || 0, 0, 0);
    return date;
  }

  private getUserIdFromAppointment(appointment: Appoitement): number | null {
    if (appointment.patient?.id) return Number(appointment.patient.id);
    if (appointment.patientId) return Number(appointment.patientId);
    return this.jwtService.getUserId();
  }

  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    setTimeout(() => this.hideNotification(), 5000);
  }

  hideNotification(): void {
    this.showAlert = false;
  }

  showSection(section: string, event?: Event): void {
    if (event) event.preventDefault();
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
    this.showLogoutModal = false;
    this.notificationService.disconnect();
    this.notificationService.clearAllNotifications();
    this.jwtService.removeToken();
    this.userName = '';
    this.menuOpen = false;
    this.router.navigateByUrl('/');
  }

  downloadDocument(doc: any): void {
    console.log('📄 Téléchargement du document:', doc);
    
    // Extraire l'URL du document
    let url = this.getDocumentUrl(doc);
    
    if (!url) {
      this.showNotification('URL du document introuvable', 'error');
      return;
    }
    
    // Si c'est une URL de fichier, l'ouvrir dans un nouvel onglet
    window.open(url, '_blank');
    this.showNotification('Ouverture du document...', 'info');
  }

  getDocumentUrl(doc: any): string {
    if (!doc) return '';
    
    if (typeof doc === 'string') {
      return doc;
    }
    
    if (typeof doc === 'object') {
      // Vérifier les différentes propriétés possibles
      if (doc.url) return doc.url;
      if (doc.content) return doc.content;
      if (doc.fileUrl) return doc.fileUrl;
      if (doc.data) return doc.data;
      if (doc.link) return doc.link;
      if (doc.path) return doc.path;
      
      // Chercher dans toutes les propriétés une chaîne qui ressemble à une URL
      for (const key in doc) {
        if (typeof doc[key] === 'string' && 
            (doc[key].startsWith('data:') || 
             doc[key].startsWith('http') || 
             doc[key].startsWith('/') ||
             doc[key].length > 50)) {
          return doc[key];
        }
      }
    }
    
    return '';
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
    if (this.selectedMedicalFile) window.print();
  }

  downloadCompleteMedicalFile(): void {
    alert(
      'Téléchargement du dossier médical complet en cours...\nCela peut prendre quelques instants.',
    );
  }

  deleteAppointement(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      this.appointementService.deleteAppointment(id).subscribe({
        next: () => {
          this.showNotification('Rendez-vous annulé avec succès', 'success');
          this.loadUserAppointments();
        },
        error: (error) => {
          console.error("Erreur lors de l'annulation :", error);
          this.showNotification("Erreur lors de l'annulation", 'error');
        },
      });
    }
  }

  updateAppointment(id: number, updatedData: Partial<Appoitement>): void {
    this.appointementService
      .updateAppointment(id, updatedData as Appoitement)
      .subscribe({
        next: () => {
          this.showNotification(
            'Rendez-vous mis à jour avec succès',
            'success',
          );
          this.loadUserAppointments();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour :', error);
          this.showNotification('Erreur lors de la mise à jour', 'error');
        },
      });
  }

  chargerCreneauxDuMedecin(doctorId: number): void {
    this.isLoadingCreneaux = true;
    this.creneauService.getCreneauxDocteur(doctorId).subscribe({
      next: (creneaux: Creneau[]) => {
        const aujourdhui = new Date();
        aujourdhui.setHours(0, 0, 0, 0);
        this.creneauxDisponibles = creneaux.filter(
          (c) => c.disponible && new Date(c.date) >= aujourdhui,
        );
        this.creneauxFiltres = [...this.creneauxDisponibles];
        this.isLoadingCreneaux = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des créneaux:', error);
        this.isLoadingCreneaux = false;
        alert('Erreur lors du chargement des créneaux disponibles');
      },
    });
  }

  filtrerCreneauxParDate(date: string): void {
    if (!date) {
      this.creneauxFiltres = [...this.creneauxDisponibles];
      return;
    }
    this.creneauxFiltres = this.creneauxDisponibles.filter(
      (c) => c.date === date,
    );
  }

  getCreneauxGroupesParDate(): { date: string; creneaux: Creneau[] }[] {
    const groupes = new Map<string, Creneau[]>();
    this.creneauxFiltres.forEach((creneau) => {
      if (!groupes.has(creneau.date)) groupes.set(creneau.date, []);
      groupes.get(creneau.date)?.push(creneau);
    });
    return Array.from(groupes.entries())
      .map(([date, creneaux]) => ({
        date,
        creneaux: creneaux.sort((a, b) =>
          a.heureDebut.localeCompare(b.heureDebut),
        ),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatHeure(heureStr: string): string {
    return heureStr.substring(0, 5);
  }

  formatAppointmentDate(dateStr: string): string {
    try {
      const date = dateStr.includes('/')
        ? (() => {
            const [d, m, y] = dateStr.split('/');
            return new Date(`${y}-${m}-${d}`);
          })()
        : new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  formatAppointmentTime(timeStr: string): string {
    if (!timeStr) return '';
    if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) return timeStr.substring(0, 5);
    return timeStr;
  }

  isStatusValidated(status: string): boolean {
    if (!status) return false;
    return ['validated', 'validé', 'valide'].includes(
      status.toLowerCase().trim(),
    );
  }

  isAppointmentTimeReached(appointment: Appoitement): boolean {
    if (!appointment.preferredDate || !appointment.preferredTime) return false;
    try {
      const appointmentDateTime = this.parseAppointmentDateTime(
        appointment.preferredDate,
        appointment.preferredTime,
      );
      const bufferTime = 5 * 60 * 1000;
      return new Date().getTime() >= appointmentDateTime.getTime() - bufferTime;
    } catch {
      return false;
    }
  }

  private parseAppointmentDateTime(dateStr: string, timeStr: string): Date {
    let date: Date;
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateStr);
    }
    const [hours, minutes] = timeStr.split(':').map(Number);
    date.setHours(hours, minutes || 0, 0, 0);
    return date;
  }

  canStartAppointment(appointment: Appoitement): boolean {
    return (
      this.isStatusValidated(appointment.status) &&
      this.isAppointmentTimeReached(appointment) &&
      appointment.status !== 'started'
    );
  }

  getTimeUntilAppointment(appointment: Appoitement): string {
    if (!appointment.preferredDate || !appointment.preferredTime) return '';
    try {
      const apptTime = this.parseAppointmentDateTime(
        appointment.preferredDate,
        appointment.preferredTime,
      );
      const diffMs = apptTime.getTime() - new Date().getTime();
      if (diffMs <= 0) return 'Le rendez-vous peut commencer';
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays > 0)
        return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
      if (diffHours > 0) return `Dans ${diffHours}h ${diffMinutes % 60}min`;
      return `Dans ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } catch {
      return '';
    }
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-default';
    switch (status.toLowerCase().trim()) {
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
      case 'completed':
      case 'terminé':
        return 'status-validated';
      default:
        return 'status-default';
    }
  }

  getStatusLabel(status: string): string {
    if (!status) return 'Non défini';
    const labels: { [key: string]: string } = {
      validated: 'Validé ',
      validé: 'Validé ',
      valide: 'Validé ',
      pending: 'En attente ⏳',
      'en attente': 'En attente ⏳',
      started: 'En cours 🔵',
      démarré: 'En cours 🔵',
      'en cours': 'En cours 🔵',
      rejected: 'Rejeté ❌',
      cancelled: 'Annulé ❌',
      annulé: 'Annulé ❌',
      refusé: 'Refusé ❌',
      completed: 'Terminé ✔️',
      terminé: 'Terminé ✔️',
    };
    return labels[status.toLowerCase().trim()] || status;
  }

  joinZoomMeeting(appointment: Appoitement): void {
    const url =
      appointment.meetingUrl ||
      appointment.zoomLink ||
      (appointment as any).zoomJoinUrl;

    if (!url) {
      this.showNotification(
        'Aucun lien de téléconsultation disponible pour ce rendez-vous',
        'error',
      );
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    this.showNotification('Ouverture du lien...', 'info');
  }

  loadUserAppointments(): void {
    const userId = this.jwtService.getUserId();
    if (!userId) {
      console.error(
        'Utilisateur non connecté - impossible de charger les rendez-vous',
      );
      this.tableauClasse = [];
      this.calculerStatistiques();
      return;
    }
    this.userId = userId;

    this.appointementService.getAppointmentsByPatient(userId).subscribe({
      next: (data) => {
        const oldAppointments = [...this.tableauClasse];
        this.tableauClasse = data;
        this.calculerStatistiques();

        // Détecter les changements de statut
        if (oldAppointments.length > 0) {
          this.detectStatusChanges(oldAppointments, data);
        }

        // Vérifier les rendez-vous qui viennent de commencer
        this.checkForStartedAppointments();
        this.checkAndNotifyUpcomingAppointments();
      },
      error: (error) => {
        console.error('Erreur chargement rendez-vous :', error);
      },
    });
  }

  detectStatusChanges(oldList: Appoitement[], newList: Appoitement[]): void {
    newList.forEach((newApp) => {
      const oldApp = oldList.find((old) => old.id === newApp.id);
      if (!oldApp || oldApp.status === newApp.status) return;

      console.log(
        `Changement détecté pour RDV #${newApp.id}: ${oldApp.status} → ${newApp.status}`,
      );
      const userId = this.getUserIdFromAppointment(newApp);
      if (!userId) {
        console.warn(
          `Impossible de trouver l'utilisateur pour le RDV ${newApp.id}`,
        );
        return;
      }

      switch (newApp.status) {
        case 'validated':
          this.notificationService.notifyUserAppointmentValidated(
            userId,
            newApp,
          );
          this.showNotification('Votre rendez-vous a été validé !', 'success');
          break;
        case 'rejected':
          this.notificationService.notifyUserAppointmentRejected(
            userId,
            newApp,
          );
          this.showNotification('Votre rendez-vous a été rejeté', 'error');
          break;
        case 'started':
          //  ENVOI NOTIFICATION IMMÉDIATE quand le statut passe à 'started'
          const zoomLink =
            newApp.meetingUrl || newApp.zoomLink || (newApp as any).zoomJoinUrl;

          // Notification visuelle
          this.showNotification(
            '🔔 VOTRE CONSULTATION A COMMENCÉ ! Rejoignez maintenant.',
            'success',
          );

          // Notification système
          this.notificationService.notifyUserAppointmentStarted(
            userId,
            newApp,
            zoomLink,
          );

          // Notification navigateur
          this.showBrowserNotification(newApp);

          // Son de notification
          this.playNotificationSound();

          // Marquer comme notifié
          localStorage.setItem(`appointment_started_${newApp.id}`, 'true');
          break;
        case 'completed':
          this.showNotification(' Votre rendez-vous est terminé', 'info');
          break;
      }
    });
  }
  checkAndNotifyUpcomingAppointments(): void {
    const now = new Date();

    this.tableauClasse.forEach((appointment) => {
      // Vérifier uniquement les rendez-vous validés ou en cours
      if (
        this.isStatusValidated(appointment.status) ||
        appointment.status === 'started'
      ) {
        // Vérifier si l'heure de début est atteinte
        if (this.isAppointmentTimeReached(appointment)) {
          // Vérifier si la notification n'a pas déjà été envoyée
          const notificationKey = `appointment_started_${appointment.id}`;
          const notificationSent = localStorage.getItem(notificationKey);

          if (!notificationSent && appointment.status === 'started') {
            // Si le rendez-vous est en cours et pas encore notifié
            this.sendAppointmentStartedNotification(appointment);
            localStorage.setItem(notificationKey, 'true');

            // Nettoyer après 1 heure
            setTimeout(() => {
              localStorage.removeItem(notificationKey);
            }, 3600000);
          } else if (
            !notificationSent &&
            this.isExactStartTimeReached(appointment) &&
            appointment.status === 'validated'
          ) {
            // Optionnel: Rappeler que le rendez-vous va commencer bientôt
            this.sendAppointmentReminderNotification(appointment);
            localStorage.setItem(
              `appointment_reminder_${appointment.id}`,
              'true',
            );
          }
        }
      }
    });
  }
  private isExactStartTimeReached(appointment: Appoitement): boolean {
    if (!appointment.preferredDate || !appointment.preferredTime) return false;

    try {
      const appointmentDateTime = this.parseAppointmentDateTime(
        appointment.preferredDate,
        appointment.preferredTime,
      );
      const now = new Date();
      const diffMinutes =
        (appointmentDateTime.getTime() - now.getTime()) / 60000;

      // Envoie la notification 0-2 minutes après l'heure de début
      return diffMinutes <= 2 && diffMinutes >= -2;
    } catch {
      return false;
    }
  }
  private sendAppointmentStartedNotification(appointment: Appoitement): void {
    const userId = this.jwtService.getUserId();
    if (!userId) return;

    const zoomLink =
      appointment.meetingUrl ||
      appointment.zoomLink ||
      (appointment as any).zoomJoinUrl;

    console.log(
      `🔔 Envoi notification début rendez-vous #${appointment.id} à l'utilisateur ${userId}`,
    );

    // Notification visuelle dans l'interface
    this.showNotification(
      `🔔 Le rendez-vous avec le médecin a commencé ! Rejoignez la consultation.`,
      'success',
    );

    // Notification système (si l'API supporte les notifications)
    this.notificationService.notifyUserAppointmentStarted(
      userId,
      appointment,
      zoomLink,
    );

    // Option: Notification browser
    this.showBrowserNotification(appointment);
  }
  private sendAppointmentReminderNotification(appointment: Appoitement): void {
    const userId = this.jwtService.getUserId();
    if (!userId) return;

    const timeUntilStart = this.getTimeUntilAppointment(appointment);

    console.log(
      `⏰ Envoi rappel rendez-vous #${appointment.id} dans ${timeUntilStart}`,
    );

    this.showNotification(
      `⏰ Rappel: Votre rendez-vous commence dans ${timeUntilStart}. Restez connecté(e) !`,
      'info',
    );
  }
  private showBrowserNotification(appointment: Appoitement): void {
    if (!('Notification' in window)) {
      console.log('Ce navigateur ne supporte pas les notifications');
      return;
    }

    // Demander la permission si nécessaire
    if (Notification.permission === 'granted') {
      const zoomLink =
        appointment.meetingUrl ||
        appointment.zoomLink ||
        (appointment as any).zoomJoinUrl;

      const notification = new Notification('🔔 Consultation médicale', {
        body: `Votre rendez-vous avec le médecin a commencé ! Cliquez pour rejoindre.`,
        icon: '/assets/icons/medical-icon.png',
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        if (zoomLink) {
          window.open(zoomLink, '_blank');
        }
        notification.close();
      };

      setTimeout(() => notification.close(), 30000);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.showBrowserNotification(appointment);
        }
      });
    }
  }

  startAppointmentWatcher(): void {
    // Vérifier toutes les minutes
    setInterval(() => {
      this.checkAndNotifyUpcomingAppointments();
    }, 60000); // 60 secondes

    // Vérification plus fréquente pour les rendez-vous proches (toutes les 10 secondes)
    setInterval(() => {
      this.checkImminentAppointments();
    }, 10000); // 10 secondes
  }
  private checkImminentAppointments(): void {
    const now = new Date();

    this.tableauClasse.forEach((appointment) => {
      if (
        this.isStatusValidated(appointment.status) &&
        appointment.status !== 'started'
      ) {
        if (!appointment.preferredDate || !appointment.preferredTime) return;

        try {
          const appointmentDateTime = this.parseAppointmentDateTime(
            appointment.preferredDate,
            appointment.preferredTime,
          );
          const diffMinutes =
            (appointmentDateTime.getTime() - now.getTime()) / 60000;

          // Vérifier si le rendez-vous est dans moins de 5 minutes
          if (diffMinutes <= 5 && diffMinutes > 0) {
            const reminderKey = `imminent_reminder_${appointment.id}`;
            const reminderSent = localStorage.getItem(reminderKey);

            if (!reminderSent) {
              this.showNotification(
                `⚠️ Votre rendez-vous commence dans ${Math.ceil(diffMinutes)} minutes !`,
                'info',
              );
              localStorage.setItem(reminderKey, 'true');

              // Nettoyer après 10 minutes
              setTimeout(() => {
                localStorage.removeItem(reminderKey);
              }, 600000);
            }
          }
        } catch (error) {
          console.error(
            'Erreur lors de la vérification du rendez-vous imminent:',
            error,
          );
        }
      }
    });
  }
  checkForStartedAppointments(): void {
    const userId = this.jwtService.getUserId();
    if (!userId) return;

    // Vérifier les rendez-vous récemment passés au statut 'started'
    this.tableauClasse.forEach((appointment) => {
      if (appointment.status === 'started') {
        const notificationKey = `started_notification_sent_${appointment.id}`;
        const notificationSent = localStorage.getItem(notificationKey);

        if (
          !notificationSent &&
          (appointment.meetingUrl || appointment.zoomLink)
        ) {
          console.log(
            `🎯 Rendez-vous #${appointment.id} est maintenant en cours!`,
          );

          // Envoyer notification
          this.sendAppointmentStartedNotification(appointment);
          localStorage.setItem(notificationKey, 'true');
        }
      }
    });
  }
  playNotificationSound(): void {
    try {
      const audio = new Audio('/assets/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch((e) => console.log('Impossible de jouer le son:', e));
    } catch (error) {
      console.log('Erreur son:', error);
    }
  }
   onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
  
    // Vérifier la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.showNotification('Le fichier ne doit pas dépasser 10MB', 'error');
      event.target.value = '';
      return;
    }
  
    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      this.showNotification('Format non supporté. Utilisez PDF, JPG, PNG ou DOC', 'error');
      event.target.value = '';
      return;
    }
  
    // Demander l'ID du rendez-vous associé
    const appointmentIdInput = prompt(
      'ID du rendez-vous associé (laissez vide pour document général) :\n\n' +
      'Rendez-vous disponibles:\n' +
      this.tableauClasse.map(a => `- ID ${a.id}: ${a.preferredDate}`).join('\n')
    );
    
    const appointmentId = appointmentIdInput ? parseInt(appointmentIdInput) : 0;
  
    // Vérifier si l'ID du rendez-vous existe (si différent de 0)
    if (appointmentId !== 0) {
      const appointmentExists = this.tableauClasse.some(a => a.id === appointmentId);
      if (!appointmentExists) {
        this.showNotification('ID de rendez-vous invalide', 'error');
        event.target.value = '';
        return;
      }
    }
  
    this.isLoadingDocuments = true;
    
    this.documentService.uploadDocument(file, appointmentId).subscribe({
      next: (response) => {
        this.showNotification('Document uploadé avec succès', 'success');
        this.loadMedicalDocuments(); // Recharger la liste
        event.target.value = ''; // Réinitialiser l'input
        this.isLoadingDocuments = false;
      },
      error: (error) => {
        console.error('Erreur upload:', error);
        this.showNotification('Erreur lors de l\'upload du document', 'error');
        this.isLoadingDocuments = false;
        event.target.value = '';
      }
    });
  }
  // Dans user-dashboard.component.ts
  loadMedicalDocuments(): void {
    const patientId = this.jwtService.getUserId();
    if (!patientId) {
      console.warn('Patient non connecté');
      return;
    }
  
    this.isLoadingDocuments = true;
    
    // Récupérer tous les rendez-vous du patient
    this.appointementService.getAppointmentsByPatient(patientId).subscribe({
      next: (rdvs: Appoitement[]) => {
        const allDocuments: any[] = [];
        
        rdvs.forEach(rdv => {
          if (rdv.medicalDocuments && rdv.medicalDocuments !== 'Aucun') {
            // Utiliser la même méthode qui fonctionne
            const docs = this.getDocumentsList(rdv.medicalDocuments);
            docs.forEach((doc: any) => {
              allDocuments.push({
                ...doc,
                appointmentId: rdv.id,
                appointmentDate: rdv.preferredDate,
                doctorName: rdv.doctor?.name || 'Médecin',
                rdvStatus: rdv.status
              });
            });
          }
        });
        
        this.medicalDocuments = allDocuments;
        this.isLoadingDocuments = false;
        this.cdr.detectChanges();
        
        console.log(`📄 ${allDocuments.length} documents chargés depuis ${rdvs.length} rendez-vous`);
      },
      error: (error) => {
        console.error('Erreur chargement documents:', error);
        this.isLoadingDocuments = false;
        this.showNotification('Erreur lors du chargement des documents', 'error');
      }
    });
  }

  getDocumentsList(patientDocuments: string): any[] {
    if (!patientDocuments || patientDocuments === 'Aucun' || patientDocuments === 'Aucun document') {
      return [];
    }
    try {
      // Essayer de parser le JSON
      const parsed = JSON.parse(patientDocuments);
      let result = [];
      
      if (Array.isArray(parsed)) {
        console.log(`Tableau de ${parsed.length} documents`);
        result = parsed;
      } else if (parsed && typeof parsed === 'object') {
        result = [parsed];
      } else {
        result = [{ name: 'Document', url: String(parsed), content: String(parsed) }];
      }
      
      return result;
    } catch (e) {
      console.error('Erreur parsing JSON:', e);
      return [{
        name: 'Document',
        url: patientDocuments,
        content: patientDocuments
      }];
    }
  }
  
getDocumentsByAppointment(): Map<number, any[]> {
  const map = new Map<number, any[]>();
  
  this.medicalDocuments.forEach(doc => {
    const key = doc.appointmentId || 0;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(doc);
  });
  
  return map;
}




deleteDocument(doc: any, appointmentId: number, event: Event): void {
  event.stopPropagation();
  
  if (confirm(`Supprimer définitivement "${doc.fileName}" ?`)) {
    this.documentService.deleteDocument(appointmentId, doc.id).subscribe({
      next: () => {
        this.medicalDocuments = this.medicalDocuments.filter(d => d.id !== doc.id);
        this.patientDocuments = this.medicalDocuments;
        this.totalDocumentsCount = this.medicalDocuments.length;
        this.showNotification('Document supprimé avec succès', 'success');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur suppression:', error);
        this.showNotification('Erreur lors de la suppression', 'error');
      }
    });
  }
}


formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}


getAppointmentById(id: number): any {
  return this.tableauClasse.find(apt => apt.id === id);
}

  
}

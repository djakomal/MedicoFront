// user-dashboard.component.ts (Mis à jour)
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

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [AppointComponent, CommonModule, ConseilComponent, RouterLink],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  // ✅ Notifications en temps réel
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
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'success';

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

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private jwtService: JwtService,
    private cdr: ChangeDetectorRef,
    private appointementService: AppointementService,
  ) {}

  ngOnInit(): void {
    this.loadUserName();
    this.loadUserAppointments();
    this.subscribeToNotifications();
    
    // ✅ Polling pour vérifier les mises à jour toutes les 10 secondes
    setInterval(() => {
      this.loadUserAppointments();
    }, 10000);
  }

  ngOnDestroy(): void {
    // ✅ Nettoyer les subscriptions
    this.notificationsSubscription?.unsubscribe();
    this.unreadCountSubscription?.unsubscribe();
  }

  // ✅ S'abonner au service de notifications
  subscribeToNotifications(): void {
    // Écouter les changements de notifications
    this.notificationsSubscription = this.notificationService.notifications$.subscribe(
      (notifications: Message[]) => {
        this.appointmentNotifications = notifications;
        this.cdr.detectChanges();
      }
    );
  
    // Écouter les changements du compteur
    this.unreadCountSubscription = this.notificationService.unreadCount$.subscribe(
      (count: number) => {
        this.unreadMessagesCount = count;
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
            
          case 'cancelled':
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
}
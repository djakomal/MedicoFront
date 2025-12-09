import { ChangeDetectorRef, Component } from '@angular/core';
import { NotificationService } from '../../../../_helps/notification.service';
import { Router } from '@angular/router';
import { JwtService } from '../../../../_helps/jwt/jwt.service';
import { FormBuilder } from '@angular/forms';
import { AppointTypeServiceService } from '../../../../_helps/appointment/appoint-type-service.service';
import { AppoitementType } from '../../../../models/appoitementType';
import { AppointmentComponent } from "../../../admin/main/appointment/appointment.component";
import { AppointComponent } from "../../appoint/appoint.component";
import { CommonModule } from '@angular/common';
import { ConseilComponent } from "../../conseil/conseil.component";

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [AppointComponent, CommonModule, ConseilComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {
  
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
  userName: string='' ; // Stocke le nom de l'utilisateur
  notifications: string[] = [];
  menuOpen: boolean = false;
  tableauClasse!:AppoitementType[]
  // Propriété pour suivre la section active
  activeSection: string = 'dashboard';
  // Gestion des popups
  showPopup: boolean = false;
  popupType: string = '';
  popupContent: any = {};
  showMedicalFilePopup: boolean = false;
  selectedMedicalFile: any = null;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private jwtService: JwtService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
        private appointementService:AppointTypeServiceService,
  ) {}

  ngOnInit() {
    this.loadUserName();
    this.notificationService.getNotifications().subscribe((notifications) => {
      this.notifications = notifications;
    });
  }

  // Méthode pour changer de section
  showSection(section: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    this.activeSection = section;
    this.cdr.detectChanges(); // Force la mise à jour de l'affichage
  }

  // Méthode pour vérifier si une section est active
  isSectionActive(section: string): boolean {
    return this.activeSection === section;
  }

  clearNotifications() {
    this.notificationService.clearNotifications();
  }
  
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.cdr.detectChanges(); // Force la mise à jour de l'affichage
    console.log("Menu toggled: ", this.menuOpen);
  }


  loadUserName(): void {
    // Afficher le contenu complet du token pour le débogage
    const decodedToken = this.jwtService.getDecodedToken();
    console.log("📜 Token décodé :", decodedToken);
    
    // Récupérer le username
    this.userName = this.jwtService.getUserName() || '';
    console.log("👤 Nom d'utilisateur affiché :", this.userName);
    
    //Retirer la partie avant le @ si c'est un email
    if (this.userName.includes('@')) {
      this.userName = this.userName.split('@')[0];
      console.log("👤 Nom d'utilisateur formaté :", this.userName);
    }
    
    // Si aucun username n'est trouvé
    if (!this.userName) {
      console.warn("⚠️ Aucun username trouvé dans le token JWT");
      console.log("💡 Vérifiez que le backend envoie bien le champ 'sub' ou 'username' dans le JWT");
    }
  }


  logout(): void {
    this.jwtService.removeToken();
    this.userName = ''; // Supprime le nom affiché
    this.menuOpen = false; // Ferme le menu
    this.router.navigateByUrl('/connex'); // Redirection vers la page de connexion
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
  /**
   * ✅ Ouvrir la popup de consultation d'un fichier médical
   */
  openMedicalFile(fileId: number): void {
    const file = this.medicalFiles.find(f => f.id === fileId);
    if (file) {
      this.selectedMedicalFile = file;
      this.showMedicalFilePopup = true;
      this.cdr.detectChanges();
      console.log('📄 Fichier médical ouvert:', file.title);
    }
  }

  /**
   * ✅ Fermer la popup du fichier médical
   */
  closeMedicalFilePopup(): void {
    this.showMedicalFilePopup = false;
    this.selectedMedicalFile = null;
    this.cdr.detectChanges();
  }

  /**
   * ✅ Télécharger un fichier médical
   */
  downloadMedicalFile(fileUrl: string, fileName: string): void {
    // Simulation du téléchargement
    console.log('📥 Téléchargement du fichier:', fileName);
    
    // En production, vous feriez un vrai téléchargement :
     window.open(fileUrl, '_blank');
    // ou
    // this.http.get(fileUrl, { responseType: 'blob' }).subscribe(blob => {
    //   const url = window.URL.createObjectURL(blob);
    //   const a = document.createElement('a');
    //   a.href = url;
    //   a.download = fileName;
    //   a.click();
    // });    // En production, vous feriez un vrai téléchargement :
     window.open(fileUrl, '_blank');
    // ou
    // this.http.get(fileUrl, { responseType: 'blob' }).subscribe(blob => {
    //   const url = window.URL.createObjectURL(blob);
    //   const a = document.createElement('a');
    //   a.href = url;
    //   a.download = fileName;
    //   a.click();
    // });
    
    alert(`Téléchargement de ${fileName} en cours...`);
  }

  /**
   * ✅ Imprimer un fichier médical
   */
  printMedicalFile(): void {
    if (this.selectedMedicalFile) {
      console.log('🖨️ Impression du fichier:', this.selectedMedicalFile.title);
      window.print();
    }
  }

  /**
   * ✅ Télécharger le dossier médical complet
   */
  downloadCompleteMedicalFile(): void {
    console.log('📥 Téléchargement du dossier médical complet');
    alert('Téléchargement du dossier médical complet en cours...\nCela peut prendre quelques instants.');
    
    // En production :
    //this.medicalFileService.downloadComplete().subscribe(blob => {
    //   const url = window.URL.createObjectURL(blob);
    //   const a = document.createElement('a');
    //   a.href = url;
    //   a.download = `dossier-medical-${this.userName}.pdf`;
    //   a.click();
    // });
  }
}
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

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [ AppointComponent,CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {
  userName: string | null = null; // Stocke le nom de l'utilisateur
  notifications: string[] = [];
  menuOpen: boolean = false;
  tableauClasse!:AppoitementType[]
  
  // Propriété pour suivre la section active
  activeSection: string = 'dashboard';

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private jwtService: JwtService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
        private appointementService:AppointTypeServiceService,
  ) {}

  ngOnInit() {
    this.notificationService.getNotifications().subscribe((notifications) => {
      this.notifications = notifications;
      this.loadUserName();
    });

    this.loadUserName();
      
  this.getAppointment();
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
    this.jwtService.getDecodedToken();
    this.userName = this.jwtService.getUserName();
    
    // Récupérer le username
    this.userName = this.jwtService.getUserName();
    console.log("Nom d'utilisateur récupéré: ", this.userName);
    
    // Si aucun username n'est trouvé, essayer de déboguer
    if (!this.userName) {
      console.warn("⚠️ Aucun username trouvé dans le token JWT");
    }
  }


  logout(): void {
    this.jwtService.removeToken();
    this.userName = null; // Supprime le nom affiché
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
}
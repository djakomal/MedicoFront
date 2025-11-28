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

  // Méthodes pour gérer les popups
  openPopup(type: string) {
    this.popupType = type;
    this.showPopup = true;
    this.cdr.detectChanges(); 
    // Définir le contenu selon le type de popup
    switch(type) {
      case 'nutrition':
        this.popupContent = {
          title: 'Maintenir une alimentation équilibrée',
          content: `
            <h3>Guide nutritionnel</h3>
            <p>Une alimentation équilibrée est essentielle pour votre santé. Voici les principes clés :</p>
            <ul>
              <li><strong>Fruits et légumes :</strong> 5 portions par jour minimum</li>
              <li><strong>Protéines :</strong> Viande maigre, poisson, œufs ou légumineuses</li>
              <li><strong>Glucides complexes :</strong> Riz complet, pâtes complètes, pain complet</li>
              <li><strong>Produits laitiers :</strong> Pour le calcium et le phosphore</li>
              <li><strong>Hydratation :</strong> 1.5 à 2 litres d'eau par jour</li>
            </ul>
            <p><strong>Conseil :</strong> Consultez un nutritionniste pour un plan personnalisé adapté à vos besoins spécifiques.</p>
          `
        };
        break;
        
      case 'relaxation':
        this.popupContent = {
          title: 'Techniques de relaxation contre le stress',
          content: `
            <h3>Exercices de relaxation</h3>
            <p>Pratiquez ces exercices quotidiennement pour réduire votre stress :</p>
            <h4>1. Respiration profonde (5 minutes)</h4>
            <ul>
              <li>Inspirez lentement pendant 4 secondes</li>
              <li>Retenez votre respiration pendant 4 secondes</li>
              <li>Expirez lentement pendant 4 secondes</li>
              <li>Répétez 10 fois</li>
            </ul>
            <h4>2. Scan corporel (10 minutes)</h4>
            <p>Allongé, focalisez-vous sur chaque partie de votre corps de haut en bas, en relâchant les tensions.</p>
            <h4>3. Méditation (10 minutes)</h4>
            <p>Trouvez un endroit calme et concentrez-vous sur vos pensées sans les juger.</p>
          `
        };
        break;
        
      case 'activite':
        this.popupContent = {
          title: 'Programme d\'activité physique adapté',
          content: `
            <h3>Programme d'activité physique</h3>
            <p>L'activité physique régulière est cruciale pour votre santé. Voici un programme adapté :</p>
            <h4>Semaine Type</h4>
            <ul>
              <li><strong>Lundi :</strong> 30 min marche rapide ou jogging léger</li>
              <li><strong>Mardi :</strong> 30 min musculation légère</li>
              <li><strong>Mercredi :</strong> Repos ou activité douce (yoga)</li>
              <li><strong>Jeudi :</strong> 30 min marche rapide ou jogging léger</li>
              <li><strong>Vendredi :</strong> 30 min musculation légère</li>
              <li><strong>Samedi :</strong> 45 min activité récréative (sport, danse, vélo)</li>
              <li><strong>Dimanche :</strong> Repos</li>
            </ul>
            <p><strong>Important :</strong> Commencez progressivement et consultez votre médecin avant tout nouveau programme.</p>
          `
        };
        break;
        
      case 'sommeil':
        this.popupContent = {
          title: 'Améliorer la qualité de votre sommeil',
          content: `
            <h3>Conseils pour un meilleur sommeil</h3>
            <p>Suivez ces recommandations pour un sommeil réparateur :</p>
            <h4>Hygiène du sommeil</h4>
            <ul>
              <li>Maintenez une routine régulière (coucher/lever à heures fixes)</li>
              <li>Évitez les écrans 1 heure avant le coucher</li>
              <li>Gardez votre chambre fraîche (16-19°C) et sombre</li>
              <li>Évitez la caféine après 14h</li>
              <li>Pratiquez une activité relaxante avant le coucher</li>
              <li>Limitez les siestes à 20 minutes maximum</li>
            </ul>
            <h4>Environnement optimal</h4>
            <p>Investissez dans un bon matelas et des oreillers confortables. La qualité de votre lit affecte directement votre sommeil.</p>
          `
        };
        break;
    }
  }

  closePopup() {
    this.showPopup = false;
    this.popupType = '';
    this.cdr.detectChanges();
  }
}
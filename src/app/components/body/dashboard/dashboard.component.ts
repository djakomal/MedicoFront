import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../../header/header.component";
import { FooterComponent } from "../../footer/footer.component";
import { ContactComponent } from "../contact/contact.component";
import { FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Language, TranslationService } from '../../../_helps/translation-service.service';
import { TranslatePipe } from "../../../_helps/translate.pipe";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  // Propriété pour suivre la section active
  activeSection: string = 'dashboard';
  menuOpen: boolean = false;
  // Gestion des popups
  showPopup: boolean = false;
  popupType: string = '';
    languageMenuOpen: boolean = false;
    currentLang: string = 'fr';
    currentLanguage: Language | undefined;
    languages: Language[] = [];
    isTranslating: boolean = false;
  popupContent: any = {};
  


  constructor(private cdr: ChangeDetectorRef,
    private  translationService: TranslationService
  ) {}

ngOnInit(){
  this.translationService.currentLang$.subscribe(lang => {
    this.currentLang = lang;
    this.currentLanguage = this.translationService.getLanguage(lang);
    this.cdr.detectChanges();
  });
}
  showSection(section: string, event?: Event) {
    if (event) {
      event.preventDefault();
    } 
    this.activeSection = section;
    this.cdr.detectChanges(); // Force la mise à jour de l'affichage
  }
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.cdr.detectChanges(); // Force la mise à jour de l'affichage
    console.log("Menu toggled: ", this.menuOpen);
  }


  openPopup(type: string) {
    console.log('Popup ouvert avec type:', type);
    this.popupType = type;
    this.showPopup = true;
    
    switch(type) {
      case 'About':
        this.popupContent = {
          title: ' À propos de Medico',
          content: `
            <div class="popup-intro">
              <p class="lead-text">
                <strong>Medico</strong> est une plateforme d'assistance médicale en ligne révolutionnaire 
                qui transforme l'accès aux soins de santé au Togo et en Afrique.
              </p>
            </div>
  
            <div class="section-block">
              <h3>🎯 Notre Mission</h3>
              <p>
                Rendre les soins de santé accessibles à tous, partout et à tout moment. 
                Nous mettons la technologie au service de votre bien-être en connectant 
                patients et professionnels de santé de manière simple, rapide et sécurisée.
              </p>
            </div>
  
            <div class="section-block">
              <h3>💡 Notre Vision</h3>
              <p>
                Devenir la référence en matière de télémédecine en Afrique, en offrant 
                une plateforme complète qui répond aux besoins de santé des populations, 
                tout en facilitant le travail des professionnels de santé.
              </p>
            </div>
  
            <div class="section-block">
              <h3>🌟 Ce qui nous distingue</h3>
              <ul class="features-list">
                <li>
                  <strong>Accessibilité 24/7 :</strong> 
                  Consultez un médecin à tout moment, depuis votre domicile ou en déplacement
                </li>
                <li>
                  <strong>Dossier Médical Numérique :</strong> 
                  Toutes vos informations de santé centralisées et sécurisées en un seul endroit
                </li>
                <li>
                  <strong>Consultations Vidéo :</strong> 
                  Téléconsultations en temps réel avec des médecins qualifiés et vérifiés
                </li>
                <li>
                  <strong>Rappels Automatiques :</strong> 
                  Ne manquez plus jamais une prise de médicament grâce à nos alertes intelligentes
                </li>
                <li>
                  <strong>Confidentialité Garantie :</strong> 
                  Vos données de santé sont cryptées et protégées selon les normes internationales
                </li>
                <li>
                  <strong>Réseau de Spécialistes :</strong> 
                  Accès à un large éventail de médecins généralistes et spécialistes
                </li>
              </ul>
            </div>
  
            <div class="section-block">
              <h3>👥 Pour qui ?</h3>
              <div class="target-audience">
                <div class="audience-card">
                  <h4>🙋 Patients</h4>
                  <p>Accès facile aux soins, suivi personnalisé, consultations à distance</p>
                </div>
                <div class="audience-card">
                  <h4>👨‍⚕️ Médecins</h4>
                  <p>Outils de diagnostic avancés, gestion simplifiée des patients, téléconsultation</p>
                </div>
                <div class="audience-card">
                  <h4>🏥 Établissements</h4>
                  <p>Digitalisation des dossiers, coordination des soins, statistiques en temps réel</p>
                </div>
              </div>
            </div>
  
            <div class="section-block">
              <h3>🔒 Sécurité et Confidentialité</h3>
              <p>
                Nous prenons la sécurité de vos données très au sérieux. Medico utilise :
              </p>
              <ul>
                <li>Cryptage de bout en bout de toutes les communications</li>
                <li>Serveurs sécurisés conformes aux normes médicales</li>
                <li>Authentification renforcée pour protéger votre compte</li>
                <li>Respect strict du secret médical</li>
              </ul>
            </div>
  
            <div class="section-block cta-section">
              <h3>Rejoignez-nous</h3>
              <p>
                Que vous soyez patient à la recherche de soins de qualité ou professionnel 
                de santé souhaitant élargir votre pratique, Medico est fait pour vous.
              </p>
              <p class="highlight-text">
                <strong>Medico - Votre santé entre vos mains, où que vous soyez.</strong>
              </p>
            </div>
  
            <div class="contact-info-popup">
              <p><strong>📍 Adresse :</strong> Lomé, Togo</p>
              <p><strong>📞 Contact :</strong> +228 93755042</p>
              <p><strong>✉️ Email :</strong> support@medico.com</p>
            </div>
          `
        };
        break;
    }
    switch(type) {
      case 'carnet':
        this.popupContent = {
          title: ' Medico: votre dossier medical numerique',
          content: `
            <div class="popup-intro">
              <p class="lead-text">
                Centralisez et accédez à toutes vos données medicles:consultations,prescriptions , résultats de laboratoire et historique d vaccinations, dans un espace sécurisé accessible a tout moment , ou qe vous soyez.
              </p>
            </div>
  

  
            <div class="section-block">
              <h3>💡 Pourqui un dossier medical numérique ?</h3>
              <p>
                Le dossiers papier se perdent. les informations sont éparpillées entre hopitaux et cliniques.Medico  les centralises toutes.Votre historique de santé est stocké en toute sécurité, vous et votre médecin dispoez d'une vue complete.
              </p>
            </div>
  
            <div class="section-block">
              <h3>🌟 Points clé</h3>
              <ul class="features-list">
                <li>
                  <strong>Fini les dossiers medicaux perdus </strong>
                </li>
                <li>
                  <strong>Accès facile pour vous et votre médecin</strong> 
                </li>
                <li>
                  <strong>Suivi fluide pour les traitements chronique</strong> 
                </li>
                <li>
                  <strong>100% sécurisé et confidentiel</strong> 
                </li
              </ul>
            </div>
  
            <div class="contact-info-popup">
              <p><strong>📍 Adresse :</strong> Lomé, Togo</p>
              <p><strong>📞 Contact :</strong> +228 93755042</p>
              <p><strong>✉️ Email :</strong> support@medico.com</p>
            </div>
          `
        };
        break;
    }
    
    this.cdr.detectChanges();
  }

  closePopup() {
    console.log('Popup fermé');
    this.showPopup = false;
    this.popupType = '';
    this.cdr.detectChanges();
  }

}

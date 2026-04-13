
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLangSubject = new BehaviorSubject<string>('fr');
  public currentLang$ = this.currentLangSubject.asObservable();

  public languages: Language[] = [
    { code: 'fr', name: 'Français', flag: '🇫🇷', direction: 'ltr' },
    { code: 'en', name: 'English', flag: '🇬🇧', direction: 'ltr' },
    { code: 'es', name: 'Español', flag: '🇪🇸', direction: 'ltr' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', direction: 'rtl' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹', direction: 'ltr' },
    { code: 'pt', name: 'Português', flag: '🇵🇹', direction: 'ltr' },
    { code: 'zh', name: '中文', flag: '🇨🇳', direction: 'ltr' },
    { code: 'ja', name: '日本語', flag: '🇯🇵', direction: 'ltr' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺', direction: 'ltr' }
  ];

  private translations: Translations = {
    fr: {
      // Navigation
      home: 'Accueil',
      resources: 'Ressources',
      service: 'Service',
      healthNews: 'Actualité santé',
      helpCenter: "Centre d'aide",
      wellness: 'Conseils bien-être',
      about: 'À propos de Nous',
      contact: 'Contact',
      
      // Authentification
      login: 'Connexion',
      logout: 'Déconnexion',
      register: 'Inscription',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      forgotPassword: 'Mot de passe oublié ?',
      rememberMe: 'Se souvenir de moi',
      
      // Profil
      welcome: 'Bienvenue',
      profile: 'Profil',
      settings: 'Paramètres',
      myAccount: 'Mon compte',
      editProfile: 'Modifier le profil',
      
      // Actions communes
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      search: 'Rechercher',
      filter: 'Filtrer',
      submit: 'Soumettre',
      close: 'Fermer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      
      // Messages
      languageChanged: 'Langue changée vers',
      selectLanguage: 'Sélectionner la langue',
      loading: 'Chargement...',
      noData: 'Aucune donnée disponible',
      error: 'Une erreur est survenue',
      success: 'Opération réussie',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer ?',
      
      // Médical
      doctor: 'Médecin',
      patient: 'Patient',
      appointment: 'Rendez-vous',
      appointments: 'Rendez-vous',
      medication: 'Médicament',
      diagnosis: 'Diagnostic',
      treatment: 'Traitement',
      prescription: 'Ordonnance',
      medicalHistory: 'Historique médical',
      symptoms: 'Symptômes',
      
      // Date et temps
      date: 'Date',
      time: 'Heure',
      day: 'Jour',
      week: 'Semaine',
      month: 'Mois',
      year: 'Année',
      today: "Aujourd'hui",
      yesterday: 'Hier',
      tomorrow: 'Demain'
    },
    en: {
      // Navigation
      home: 'Home',
      resources: 'Resources',
      service: 'Service',
      healthNews: 'Health News',
      helpCenter: 'Help Center',
      wellness: 'Wellness Tips',
      about: 'About Us',
      contact: 'Contact',
      
      // Authentication
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
      
      // Profile
      welcome: 'Welcome',
      profile: 'Profile',
      settings: 'Settings',
      myAccount: 'My Account',
      editProfile: 'Edit Profile',
      
      // Common actions
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      submit: 'Submit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      
      // Messages
      languageChanged: 'Language changed to',
      selectLanguage: 'Select Language',
      loading: 'Loading...',
      noData: 'No data available',
      error: 'An error occurred',
      success: 'Operation successful',
      confirmDelete: 'Are you sure you want to delete?',
      
      // Medical
      doctor: 'Doctor',
      patient: 'Patient',
      appointment: 'Appointment',
      appointments: 'Appointments',
      medication: 'Medication',
      diagnosis: 'Diagnosis',
      treatment: 'Treatment',
      prescription: 'Prescription',
      medicalHistory: 'Medical History',
      symptoms: 'Symptoms',
      
      // Date and time
      date: 'Date',
      time: 'Time',
      day: 'Day',
      week: 'Week',
      month: 'Month',
      year: 'Year',
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow'
    },
    
    de: {
      // Navigation
      home: 'Startseite',
      resources: 'Ressourcen',
      service: 'Service',
      healthNews: 'Gesundheitsnachrichten',
      helpCenter: 'Hilfezentrum',
      wellness: 'Wellness-Tipps',
      about: 'Über uns',
      contact: 'Kontakt',
      
      // Authentifizierung
      login: 'Anmelden',
      logout: 'Abmelden',
      register: 'Registrieren',
      email: 'E-Mail',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      forgotPassword: 'Passwort vergessen?',
      rememberMe: 'Angemeldet bleiben',
      
      // Profil
      welcome: 'Willkommen',
      profile: 'Profil',
      settings: 'Einstellungen',
      myAccount: 'Mein Konto',
      editProfile: 'Profil bearbeiten',
      
      // Gemeinsame Aktionen
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      add: 'Hinzufügen',
      search: 'Suchen',
      filter: 'Filtern',
      submit: 'Absenden',
      close: 'Schließen',
      back: 'Zurück',
      next: 'Weiter',
      previous: 'Zurück',
      
      // Nachrichten
      languageChanged: 'Sprache geändert zu',
      selectLanguage: 'Sprache wählen',
      loading: 'Lädt...',
      noData: 'Keine Daten verfügbar',
      error: 'Ein Fehler ist aufgetreten',
      success: 'Vorgang erfolgreich',
      confirmDelete: 'Möchten Sie wirklich löschen?',
      
      // Medizinisch
      doctor: 'Arzt',
      patient: 'Patient',
      appointment: 'Termin',
      appointments: 'Termine',
      medication: 'Medikament',
      diagnosis: 'Diagnose',
      treatment: 'Behandlung',
      prescription: 'Rezept',
      medicalHistory: 'Krankengeschichte',
      symptoms: 'Symptome',
      
      // Datum und Zeit
      date: 'Datum',
      time: 'Zeit',
      day: 'Tag',
      week: 'Woche',
      month: 'Monat',
      year: 'Jahr',
      today: 'Heute',
      yesterday: 'Gestern',
      tomorrow: 'Morgen'
    },
    // Ajoutez les autres langues (it, pt, zh, ja, ru) avec la même structure
  };

  constructor() {
    const savedLang = localStorage.getItem('preferredLanguage') || 'fr';
    this.setLanguage(savedLang);
  }

  getCurrentLang(): string {
    return this.currentLangSubject.value;
  }

  setLanguage(langCode: string): void {
    if (this.translations[langCode]) {
      this.currentLangSubject.next(langCode);
      localStorage.setItem('preferredLanguage', langCode);
      
      const language = this.getLanguage(langCode);
      document.documentElement.lang = langCode;
      document.documentElement.dir = language?.direction || 'ltr';
    }
  }

  translate(key: string, params?: { [key: string]: string }): string {
    const lang = this.getCurrentLang();
    let translation = this.translations[lang]?.[key] || this.translations['fr'][key] || key;
    
    // Remplacer les paramètres dans la traduction
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }
    
    return translation;
  }

  getLanguage(code: string): Language | undefined {
    return this.languages.find(l => l.code === code);
  }

  // Ajouter une nouvelle traduction dynamiquement
  addTranslation(lang: string, key: string, value: string): void {
    if (!this.translations[lang]) {
      this.translations[lang] = {};
    }
    this.translations[lang][key] = value;
  }

  // Ajouter plusieurs traductions
  addTranslations(lang: string, translations: { [key: string]: string }): void {
    if (!this.translations[lang]) {
      this.translations[lang] = {};
    }
    this.translations[lang] = { ...this.translations[lang], ...translations };
  }
}
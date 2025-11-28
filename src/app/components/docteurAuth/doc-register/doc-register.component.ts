import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { JwtService } from '../../../_helps/jwt/jwt.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Docteur } from '../../../models/docteur';
import { Speciality } from '../../../models/speciality';
// import { Speciality } from '../../../models/speciality';

@Component({
  selector: 'app-doc-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './doc-register.component.html',
  styleUrl: './doc-register.component.css',
})
export class DocRegisterComponent implements OnInit {
  registerForm: FormGroup = new FormGroup({});
  currentStep: number = 1;
  jours: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  // specialities = this.getSpecialityOptions();

  constructor(
    private jwtService: JwtService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        // Step 1: Informations personnelles
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email, this.emailValidator]],
        tel: [''],

        // Step 2: Informations professionnelles
        // speciality: [''], // IMPORTANT: Doit être vide au départ
        licence: ['', [Validators.required]],
        professionalAddress: [''],
        anneesExperience: [''],
        hollyDays: [''],
        creneaux: this.fb.array([]),

        // Step 3: Informations du compte
        username: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmpassword: ['', [Validators.required]],

        // Step 4: Documents
        photoUrl: [''],
        cvurl: [''],
      },
      { validators: this.passwordMatchValidator }
    );

    // Attendre que le DOM soit chargé avant de configurer les gestionnaires d'événements
    setTimeout(() => {
      this.setupStepNavigation();
      this.setupPasswordToggles();
      this.setupFileInputPreviews();
    }, 0);

    // Debug: Observer les changements de spécialité
    this.registerForm.get('speciality')?.valueChanges.subscribe((value) => {
      console.log('Spécialité changée:', value);
    });
  }

  get creneaux(): FormArray {
    return this.registerForm.get('creneaux') as FormArray;
  }

  // Créer un nouveau FormGroup pour un créneau
  creerCreneauFormGroup(): FormGroup {
    return this.fb.group({
      jour: ['', Validators.required],
      heureDebut: ['', Validators.required],
      heureFin: ['', Validators.required],
    });
  }

  // Ajouter un nouveau créneau
  ajouterCreneau(): void {
    this.creneaux.push(this.creerCreneauFormGroup());
  }

  // Supprimer un créneau
  supprimerCreneau(index: number): void {
    if (this.creneaux.length > 1) {
      this.creneaux.removeAt(index);
    } else {
      alert('Vous devez avoir au moins un créneau de disponibilité');
    }
  }

  // Validateur pour vérifier que les mots de passe correspondent
  passwordMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmpassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Validateur d'e-mail personnalisé
  emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(control.value) ? null : { invalidEmail: true };
  }

  // Navigation entre les étapes
  goToStep(step: number): void {
    console.log(".......DONNEES DE L'ETAPE", step, '........');

    switch (step) {
      case 2:
        console.log('Nom:', this.registerForm.get('name')?.value);
        console.log('Email:', this.registerForm.get('email')?.value);
        console.log('Téléphone:', this.registerForm.get('tel')?.value);
        break;

      case 3:
        console.log('Licence:', this.registerForm.get('licence')?.value);
        console.log(
          'Adresse professionnelle:',
          this.registerForm.get('professionalAddress')?.value
        );
        console.log(
          "Années d'expérience:",
          this.registerForm.get('anneesExperience')?.value
        );
        console.log(
          'Jours de congé:',
          this.registerForm.get('hollyDays')?.value
        );
        break;

      case 4:
        console.log(
          "Nom d'utilisateur:",
          this.registerForm.get('username')?.value
        );
        console.log(
          'Mot de passe:',
          this.registerForm.get('password')?.value ? '****' : '(vide)'
        );
        console.log(
          'Confirmation:',
          this.registerForm.get('confirmpassword')?.value ? '****' : '(vide)'
        );
        break;

      case 5:
        console.log('Photo URL:', this.registerForm.get('photoUrl')?.value);
        console.log('CV URL:', this.registerForm.get('cvurl')?.value);
        break;
    }
    console.log(
      '....................................................................................'
    );

    if (step < 1 || step > 4) return;

    // Masquer toutes les étapes
    const stepContents = document.querySelectorAll('.step-content');
    stepContents.forEach((content) => {
      content.classList.remove('active');
    });

    // Afficher l'étape cible
    const targetStepContent = document.getElementById('step' + step);
    if (targetStepContent) {
      targetStepContent.classList.add('active');
    } else {
      console.error('Step content not found:', 'step' + step);
    }

    // Mettre à jour les indicateurs d'étape
    const steps = document.querySelectorAll('.step');
    steps.forEach((stepElement) => {
      const stepNumber = parseInt(stepElement.getAttribute('data-step') || '0');
      if (stepNumber < step) {
        stepElement.classList.add('completed');
        stepElement.classList.remove('active');
      } else if (stepNumber === step) {
        stepElement.classList.add('active');
        stepElement.classList.remove('completed');
      } else {
        stepElement.classList.remove('active', 'completed');
      }
    });

    this.currentStep = step;
  }

  // Configuration des événements pour la navigation par étapes
  setupStepNavigation(): void {
    // Supprimer d'abord tous les écouteurs d'événements existants
    const nextButtons = document.querySelectorAll('.next-button');
    const prevButtons = document.querySelectorAll('.prev-button');

    nextButtons.forEach((button) => {
      const newButton = button.cloneNode(true);
      button.parentNode?.replaceChild(newButton, button);
    });

    prevButtons.forEach((button) => {
      const newButton = button.cloneNode(true);
      button.parentNode?.replaceChild(newButton, button);
    });

    // Réattacher les écouteurs d'événements
    document.querySelectorAll('.next-button').forEach((button) => {
      button.addEventListener('click', (event) => {
        const target = event.currentTarget as HTMLElement;
        const targetStep = parseInt(target.getAttribute('data-step') || '1');
        console.log('Next button clicked, target step:', targetStep);

        // VALIDATION AVANT DE PASSER À L'ÉTAPE SUIVANTE
        const currentStepNumber = targetStep - 1; // L'étape actuelle est celle avant la cible

        if (this.validateCurrentStep(currentStepNumber)) {
          this.goToStep(targetStep);
        } else {
          this.showValidationErrors(currentStepNumber);
        }
      });
    });

    document.querySelectorAll('.prev-button').forEach((button) => {
      button.addEventListener('click', (event) => {
        const target = event.currentTarget as HTMLElement;
        const targetStep = parseInt(target.getAttribute('data-step') || '1');
        console.log('Prev button clicked, target step:', targetStep);
        this.goToStep(targetStep);
      });
    });
  }

  // Validation des étapes avec messages d'erreur détaillés
  validateCurrentStep(step: number): boolean {
    let isValid = true;
    let errorMessages: string[] = [];

    switch (step) {
      case 1:
        if (!this.registerForm.get('name')?.valid) {
          errorMessages.push('Le nom complet est requis');
          isValid = false;
        }
        if (!this.registerForm.get('email')?.valid) {
          errorMessages.push('Un email valide est requis');
          isValid = false;
        }
        if (!this.registerForm.get('tel')?.valid) {
          errorMessages.push('Un numero de telephone valide est requis');
          isValid = false;
        }
        break;

      // case 2:
      //   const speciality = this.registerForm.get('speciality');
      //   console.log('Validation étape 2 - Spécialité:', speciality?.value, 'Valid:', speciality?.valid);

      //   if (!speciality?.valid || !speciality?.value) {
      //     errorMessages.push('La spécialité est requise');
      //     isValid = false;
      //   }
      //   break;

      case 3:
        if (!this.registerForm.get('username')?.valid) {
          errorMessages.push("Le nom d'utilisateur est requis");
          isValid = false;
        }
        if (!this.registerForm.get('password')?.valid) {
          errorMessages.push(
            'Le mot de passe doit contenir au moins 6 caractères'
          );
          isValid = false;
        }
        if (!this.registerForm.get('confirmpassword')?.valid) {
          errorMessages.push('La confirmation du mot de passe est requise');
          isValid = false;
        }
        if (
          this.registerForm.get('password')?.value !==
          this.registerForm.get('confirmpassword')?.value
        ) {
          errorMessages.push('Les mots de passe ne correspondent pas');
          isValid = false;
        }
        break;

      default:
        return true;
    }

    if (!isValid) {
      console.error('Erreurs de validation:', errorMessages);
    }

    return isValid;
  }

  // Afficher les erreurs de validation
  showValidationErrors(step: number): void {
    let message = 'Veuillez corriger les erreurs suivantes :\n\n';

    switch (step) {
      case 1:
        if (!this.registerForm.get('name')?.valid) {
          message += '• Le nom complet est requis\n';
        }
        if (!this.registerForm.get('email')?.valid) {
          message += '• Un email valide est requis\n';
        }
        break;

      case 2:
        if (
          !this.registerForm.get('licence')?.valid ||
          !this.registerForm.get('licence')?.value
        ) {
          message += '• La licence est requise\n';
        }
        break;

      case 3:
        if (!this.registerForm.get('username')?.valid) {
          message += "• Le nom d'utilisateur est requis\n";
        }
        if (!this.registerForm.get('password')?.valid) {
          message += '• Le mot de passe doit contenir au moins 6 caractères\n';
        }
        if (
          this.registerForm.get('password')?.value !==
          this.registerForm.get('confirmpassword')?.value
        ) {
          message += '• Les mots de passe ne correspondent pas\n';
        }
        break;
    }

    alert(message);
  }

  // Configuration des boutons de basculement de visibilité des mots de passe
  setupPasswordToggles(): void {
    const passwordToggles = document.querySelectorAll('.password-toggle');

    passwordToggles.forEach((toggle) => {
      toggle.addEventListener('click', function (this: HTMLElement) {
        const passwordField = this.previousElementSibling as HTMLInputElement;
        const type =
          passwordField.getAttribute('type') === 'password'
            ? 'text'
            : 'password';
        passwordField.setAttribute('type', type);

        const svg = this.querySelector('svg');
        if (svg) {
          if (type === 'text') {
            svg.innerHTML =
              '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
          } else {
            svg.innerHTML =
              '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
          }
        }
      });
    });
  }

  // Configuration des aperçus des fichiers importés
  setupFileInputPreviews(): void {
    const fileInputs = document.querySelectorAll('input[type="file"]');

    fileInputs.forEach((input) => {
      input.addEventListener('change', function (this: HTMLInputElement) {
        const files = this.files;
        const fileName = files && files[0]?.name;

        if (fileName) {
          const uploadText =
            this.parentElement?.querySelector('.file-upload-text');
          if (uploadText) {
            uploadText.textContent = fileName;
          }
        }
      });
    });
  }

  // Méthode d'inscription
  Register(): void {
    if (!this.registerForm.valid ) {
      alert('Veuillez remplir correctement tous les champs obligatoires.');
      console.log('Form errors:', this.registerForm.errors);
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          console.log(`${key} errors:`, control.errors);
        }
      });
      return;
    }
    const email = this.registerForm.get('email')?.value;

    const registerData = {
      ...this.registerForm.value,
      creneaux: this.creneaux.value // Assurez-vous que les créneaux sont inclus
    };
    
    console.log('Données d\'inscription:', registerData);
    
    // Envoyer les données au service
    this.jwtService.registerDoc(registerData).subscribe({
      next: (response) => {
        alert('Inscription réussie ! Un email de confirmation vous a été envoyé.');
        this.router.navigateByUrl('DocLogin');
        
      },

      error: (error) => {
        if (error.status === 400) {
          alert(error.error.message || 'Erreur de validation des données.');
        } else {
          alert('Une erreur est survenue lors de l\'inscription. Veuillez réessayer plus tard.');
        }
        console.error('Erreur d\'inscription:', error);
      }
    });
  }
  

  // Traitement des fichiers avant envoi
  handleFileInput(event: Event, fieldName: string): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      console.log(`Fichier ${fieldName} chargé:`, file.name);
    }
  }

  // Génération de enum de speciality dynamiquement
  // getSpecialityOptions() {
  //   const labels: Record<string, string> = {
  //     'GENERAL': 'Médecin généraliste',
  //     'DENTISTE': 'Dentiste',
  //     'CARDIOLOGUE': 'Cardiologie',
  //     'DERMATOLOGUE': 'Dermatologie',
  //     'GYNECOLOGUE': 'Gynécologie',
  //     'OPHTALMOLOGUE': 'Ophtalmologie',
  //     'PEDIATRE': 'Pédiatrie',
  //     'PSYCHIATRE': 'Psychiatrie',
  //     'ORL': 'ORL',
  //     'RHUMATOLOGUE': 'Rhumatologie',
  //     'AUTRE': 'Autre spécialité'
  //   };

  //   return Object.keys(Speciality)
  //     .filter(key => isNaN(Number(key)))
  //     .map(key => ({
  //       value: key,
  //       label: labels[key] || key
  //     }));
  // }

  // Méthode pour valider avant de passer à l'étape suivante (appelée depuis le HTML)
  validateAndGoToStep(targetStep: number): void {
    const currentStep = targetStep - 1;

    if (this.validateCurrentStep(currentStep)) {
      this.goToStep(targetStep);
    } else {
      this.showValidationErrors(currentStep);
    }
  }

  // NOUVEAU: Gestion du changement de spécialité
  // onSpecialityChange(event: Event): void {
  //   const target = event.target as HTMLSelectElement;
  //   const value = target.value;
  //   console.log('Spécialité changée (via onSpecialityChange):', value);

  //   // Mise à jour explicite du FormControl
  //   this.registerForm.patchValue({ speciality: value });
  //   this.registerForm.get('speciality')?.markAsTouched();

  //   console.log('Nouvelle valeur du FormControl:', this.registerForm.get('speciality')?.value);
  // }
}

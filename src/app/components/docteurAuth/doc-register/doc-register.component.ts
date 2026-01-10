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
  message = '';
  errorMessage = ''; // ✅ Nouveau : pour afficher les erreurs
  jours: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  specialities = Object.values(Speciality);

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
        speciality: [Speciality.GENERAL, [Validators.required]],
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

    setTimeout(() => {
      this.setupStepNavigation();
      this.setupPasswordToggles();
      this.setupFileInputPreviews();
    }, 0);

    this.registerForm.get('speciality')?.valueChanges.subscribe((value) => {
      console.log('Spécialité changée:', value);
    });
  }

  get creneaux(): FormArray {
    return this.registerForm.get('creneaux') as FormArray;
  }

  creerCreneauFormGroup(): FormGroup {
    return this.fb.group({
      jour: ['', Validators.required],
      heureDebut: ['', Validators.required],
      heureFin: ['', Validators.required],
    });
  }

  ajouterCreneau(): void {
    this.creneaux.push(this.creerCreneauFormGroup());
  }

  supprimerCreneau(index: number): void {
    if (this.creneaux.length > 1) {
      this.creneaux.removeAt(index);
    } else {
      alert('Vous devez avoir au moins un créneau de disponibilité');
    }
  }

  passwordMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmpassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(control.value) ? null : { invalidEmail: true };
  }

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
        console.log('Adresse professionnelle:', this.registerForm.get('professionalAddress')?.value);
        console.log("Années d'expérience:", this.registerForm.get('anneesExperience')?.value);
        console.log('Jours de congé:', this.registerForm.get('hollyDays')?.value);
        break;

      case 4:
        console.log("Nom d'utilisateur:", this.registerForm.get('username')?.value);
        console.log('Mot de passe:', this.registerForm.get('password')?.value ? '****' : '(vide)');
        console.log('Confirmation:', this.registerForm.get('confirmpassword')?.value ? '****' : '(vide)');
        break;

      case 5:
        console.log('Photo URL:', this.registerForm.get('photoUrl')?.value);
        console.log('CV URL:', this.registerForm.get('cvurl')?.value);
        break;
    }
    console.log('..................................................................................');

    if (step < 1 || step > 4) return;

    const stepContents = document.querySelectorAll('.step-content');
    stepContents.forEach((content) => {
      content.classList.remove('active');
    });

    const targetStepContent = document.getElementById('step' + step);
    if (targetStepContent) {
      targetStepContent.classList.add('active');
    } else {
      console.error('Step content not found:', 'step' + step);
    }

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

  setupStepNavigation(): void {
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

    document.querySelectorAll('.next-button').forEach((button) => {
      button.addEventListener('click', (event) => {
        const target = event.currentTarget as HTMLElement;
        const targetStep = parseInt(target.getAttribute('data-step') || '1');
        console.log('Next button clicked, target step:', targetStep);

        const currentStepNumber = targetStep - 1;

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

      case 2:
        const speciality = this.registerForm.get('speciality');
        console.log('Validation étape 2 - Spécialité:', speciality?.value, 'Valid:', speciality?.valid);

        if (!speciality?.valid || !speciality?.value) {
          errorMessages.push('La spécialité est requise');
          isValid = false;
        }
        break;

      case 3:
        if (!this.registerForm.get('username')?.valid) {
          errorMessages.push("Le nom d'utilisateur est requis");
          isValid = false;
        }
        if (!this.registerForm.get('password')?.valid) {
          errorMessages.push('Le mot de passe doit contenir au moins 6 caractères');
          isValid = false;
        }
        if (!this.registerForm.get('confirmpassword')?.valid) {
          errorMessages.push('La confirmation du mot de passe est requise');
          isValid = false;
        }
        if (this.registerForm.get('password')?.value !== this.registerForm.get('confirmpassword')?.value) {
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

  showValidationErrors(step: number): void {
    this.message = '';

    switch (step) {
      case 1:
        if (!this.registerForm.get('name')?.valid) {
          this.message += '• Le nom complet est requis\n';
        }
        if (!this.registerForm.get('email')?.valid) {
          this.message += '• Un email valide est requis\n';
        }
        break;

      case 2:
        const speciality = this.registerForm.get('speciality');
        console.log('Value:', speciality?.value);

        if (!this.registerForm.get('licence')?.valid || !this.registerForm.get('licence')?.value) {
          this.message += '• La licence est requise\n';
        }
        if (!this.registerForm.get('speciality')?.valid || !this.registerForm.get('speciality')?.value) {
          this.message += '• La spécialité est requise\n';
        }
        break;

      case 3:
        if (!this.registerForm.get('username')?.valid) {
          this.message += "• Le nom d'utilisateur est requis\n";
        }
        if (!this.registerForm.get('password')?.valid) {
          this.message += '• Le mot de passe doit contenir au moins 6 caractères\n';
        }
        if (this.registerForm.get('password')?.value !== this.registerForm.get('confirmpassword')?.value) {
          this.message += '• Les mots de passe ne correspondent pas\n';
        }
        break;
    }

    alert(this.message);
  }

  setupPasswordToggles(): void {
    const passwordToggles = document.querySelectorAll('.password-toggle');

    passwordToggles.forEach((toggle) => {
      toggle.addEventListener('click', function (this: HTMLElement) {
        const passwordField = this.previousElementSibling as HTMLInputElement;
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);

        const svg = this.querySelector('svg');
        if (svg) {
          if (type === 'text') {
            svg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
          } else {
            svg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
          }
        }
      });
    });
  }

  setupFileInputPreviews(): void {
    const fileInputs = document.querySelectorAll('input[type="file"]');

    fileInputs.forEach((input) => {
      input.addEventListener('change', function (this: HTMLInputElement) {
        const files = this.files;
        const fileName = files && files[0]?.name;

        if (fileName) {
          const uploadText = this.parentElement?.querySelector('.file-upload-text');
          if (uploadText) {
            uploadText.textContent = fileName;
          }
        }
      });
    });
  }

  // ✅ MÉTHODE D'INSCRIPTION AVEC GESTION D'ERREUR
  Register(): void {
    // Réinitialiser le message d'erreur
    this.errorMessage = '';
    
    if (!this.registerForm.valid) {
      alert('Veuillez remplir correctement tous les champs obligatoires.');
      console.log('Valeur de speciality:', this.registerForm.get('speciality')?.value);
      console.log('Form errors:', this.registerForm.errors);
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          console.log(`${key} errors:`, control.errors);
        }
      });
      return;
    }

    const registerData = {
      ...this.registerForm.value,
      creneaux: this.creneaux.value
    };
    
    console.log('Données d\'inscription:', registerData);
    
    this.jwtService.registerDoc(registerData).subscribe({
      next: (response) => {
        alert('Inscription réussie ! Un email de confirmation vous a été envoyé.');
        this.router.navigateByUrl('DocLogin');
      },

      error: (error) => {
        console.error('Erreur complète:', error);
        
        //Gestion spécifique des erreurs
        if (error.status === 400) {
          // Vérifier si c'est une erreur de username existant
          const errorMsg = error.error?.message || error.error || 'Erreur de validation';
          
          if (typeof errorMsg === 'string') {
            if (errorMsg.includes('nom d\'utilisateur') || errorMsg.includes('username')) {
              this.errorMessage = ' Ce nom d\'utilisateur est déjà utilisé. Veuillez en choisir un autre.';
              alert(this.errorMessage);
              // Retourner à l'étape 3 (compte)
              this.goToStep(3);
            } else if (errorMsg.includes('email')) {
              this.errorMessage = 'Cet email est déjà utilisé. Veuillez en utiliser un autre.';
              alert(this.errorMessage);
              // Retourner à l'étape 1 (informations personnelles)
              this.goToStep(1);
            } else {
              this.errorMessage = ' ' + errorMsg;
              alert(this.errorMessage);
            }
          } else {
            this.errorMessage = ' Erreur de validation des données.';
            alert(this.errorMessage);
          }
        } else if (error.status === 409) {
          // Conflit (souvent utilisé pour les doublons)
          this.errorMessage = ' Ce nom d\'utilisateur ou cet email existe déjà.';
          alert(this.errorMessage);
        } else if (error.status === 0) {
          // Erreur de connexion au serveur
          this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
          alert(this.errorMessage);
        } else {
          this.errorMessage = ' Une erreur est survenue lors de l\'inscription. Veuillez réessayer plus tard.';
          alert(this.errorMessage);
        }
        
        console.error('Erreur d\'inscription:', error);
      }
    });
  }

  handleFileInput(event: Event, fieldName: string): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      console.log(`Fichier ${fieldName} chargé:`, file.name);
    }
  }

  validateAndGoToStep(targetStep: number): void {
    const currentStep = targetStep - 1;

    if (this.validateCurrentStep(currentStep)) {
      this.goToStep(targetStep);
    } else {
      this.showValidationErrors(currentStep);
    }
  }
}
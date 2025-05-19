import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { JwtService } from '../../../_helps/jwt/jwt.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doc-register',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './doc-register.component.html',
  styleUrl: './doc-register.component.css'
})
export class DocRegisterComponent implements OnInit{
  registerForm: FormGroup = new FormGroup({});
  currentStep: number = 1;

  constructor(
    private jwtService: JwtService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      // Step 1: Informations personnelles
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, this.emailValidator]],
      tel: [''],

      // Step 2: Informations professionnelles
      speciality: ['', [Validators.required]],
      licence: [''],
      professionalAddress: [''],
      anneesExperience: [''],
      hollyDays: [''],

      // Step 3: Informations du compte
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmpassword: ['', [Validators.required]],

      // Step 4: Documents
      photoUrl: [''],
      cvurl: ['']
    }, { validators: this.passwordMatchValidator });

    // Configuration de la navigation par étapes
    this.setupStepNavigation();
    this.setupPasswordToggles();
    this.setupFileInputPreviews();
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
    if (step < 1 || step > 4) return;

    // Masquer toutes les étapes
    const stepContents = document.querySelectorAll('.step-content');
    stepContents.forEach(content => {
      content.classList.remove('active');
    });

    // Afficher l'étape cible
    document.getElementById('step' + step)?.classList.add('active');

    // Mettre à jour les indicateurs d'étape
    const steps = document.querySelectorAll('.step');
    steps.forEach(stepElement => {
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
    setTimeout(() => {
      const nextButtons = document.querySelectorAll('.next-button');
      const prevButtons = document.querySelectorAll('.prev-button');

      nextButtons.forEach(button => {
        button.addEventListener('click', (event) => {
          const targetStep = parseInt((event.currentTarget as HTMLElement).getAttribute('data-step') || '1');
          
          // Valider l'étape actuelle avant de passer à la suivante
          if (this.validateCurrentStep(this.currentStep)) {
            this.goToStep(targetStep);
          }
        });
      });

      prevButtons.forEach(button => {
        button.addEventListener('click', (event) => {
          const targetStep = parseInt((event.currentTarget as HTMLElement).getAttribute('data-step') || '1');
          this.goToStep(targetStep);
        });
      });
    });
  }

  // Validation des étapes
  validateCurrentStep(step: number): boolean {
    switch (step) {
      case 1:
        // Valider les champs de l'étape 1
        return (this.registerForm.get('name')?.valid ?? false)
          && (this.registerForm.get('email')?.valid ?? false);
      case 2:
        // Valider les champs de l'étape 2
        return (this.registerForm.get('speciality')?.valid ?? false)
          && (this.registerForm.get('licence')?.valid ?? false)
      case 3:
        // Valider les champs de l'étape 3
        return (this.registerForm.get('username')?.valid ?? false)
          && (this.registerForm.get('password')?.valid?? false) 
          && (this.registerForm.get('confirmpassword')?.valid?? false)
          && (this.registerForm.get('password')?.value === this.registerForm.get('confirmpassword')?.value)
      default:
        return true;
    }
  }

  // Configuration des boutons de basculement de visibilité des mots de passe
  setupPasswordToggles(): void {
    setTimeout(() => {
      const passwordToggles = document.querySelectorAll('.password-toggle');
      
      passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function(this: HTMLElement) {
          const passwordField = this.previousElementSibling as HTMLInputElement;
          const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
          passwordField.setAttribute('type', type);
          
          // Changer l'icône en fonction de la visibilité du mot de passe
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
    });
  }

  // Configuration des aperçus des fichiers importés
  setupFileInputPreviews(): void {
    setTimeout(() => {
      const fileInputs = document.querySelectorAll('input[type="file"]');
      
      fileInputs.forEach(input => {
        input.addEventListener('change', function(this: HTMLInputElement) {
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
    });
  }

  // Méthode d'inscription
  Register(): void {
    if (!this.registerForm.valid) {
      alert('Veuillez remplir correctement tous les champs obligatoires.');
      return;
    }

    const registerData = this.registerForm.value;
    
    // Envoyer les données au service
    this.jwtService.registerDoc(registerData).subscribe({
      next: (response) => {
        alert('Inscription réussie ! Un email de confirmation vous a été envoyé.');
        this.router.navigateByUrl('login');
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

  // Traitement des fichiers avant envoi (optionnel)
  handleFileInput(event: Event, fieldName: string): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      // Vous pouvez implémenter la logique pour traiter le fichier ici
      // Par exemple, le convertir en base64 ou l'envoyer à un service de stockage
      console.log(`Fichier ${fieldName} chargé:`, file.name);
    }
  }

}

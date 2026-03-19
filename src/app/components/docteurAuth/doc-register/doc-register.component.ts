import { Component, OnInit } from '@angular/core';
import {
  AbstractControl, FormArray, FormBuilder,
  FormGroup, ReactiveFormsModule, ValidationErrors, Validators,
} from '@angular/forms';
import { JwtService } from '../../../_helps/jwt/jwt.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Docteur } from '../../../models/docteur';
import { Speciality } from '../../../models/speciality';
import { DocteurService } from '../../../_helps/Docteur/docteur.service';

@Component({
  selector: 'app-doc-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './doc-register.component.html',
  styleUrl: './doc-register.component.css',
})
export class DocRegisterComponent implements OnInit {

  registerForm!: FormGroup;
  otpForm!: FormGroup;
  currentStep: number = 1;
  message       = '';
  errorMessage  = '';
  successMessage = '';
  isLoading     = false;
  jours: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  specialities = Object.values(Speciality);

  constructor(
    private jwtService: JwtService,
    private fb: FormBuilder,
    private router: Router,
    private docteurService: DocteurService,
  ) {}
  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        name:                ['', [Validators.required]],
        email:               ['', [Validators.required, Validators.email, this.emailValidator]],
        tel:                 [''],
        speciality:          [Speciality.GENERAL, [Validators.required]],
        licence:             ['', [Validators.required]],
        professionalAddress: [''],
        anneesExperience:    [''],
        hollyDays:           [''],
        creneaux:            this.fb.array([]),
        username:            ['', [Validators.required]],
        password:            ['', [Validators.required, Validators.minLength(8)]],
        confirmpassword:     ['', [Validators.required]],
        photoUrl:            [''],
        cvurl:               [''],
      },
      { validators: this.passwordMatchValidator }
    );

    this.otpForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });

    // Initialiser les toggles mot de passe après rendu
    setTimeout(() => this.setupPasswordToggles(), 0);
  }
  get creneaux(): FormArray {
    return this.registerForm.get('creneaux') as FormArray;
  }
  creerCreneauFormGroup(): FormGroup {
    return this.fb.group({
      jour:       ['', Validators.required],
      heureDebut: ['', Validators.required],
      heureFin:   ['', Validators.required],
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
    const password        = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmpassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(control.value) ? null : { invalidEmail: true };
  }
  goToStep(step: number): void {
    this.errorMessage = '';

    // Mettre à jour les classes CSS des indicateurs
    document.querySelectorAll('.step').forEach(el => {
      const n = parseInt(el.getAttribute('data-step') || '0');
      el.classList.remove('active', 'completed');
      if (n < step)      el.classList.add('completed');
      else if (n === step) el.classList.add('active');
    });

    // Afficher/masquer les contenus d'étape
    document.querySelectorAll('.step-content').forEach(c => c.classList.remove('active'));
    document.getElementById('step' + step)?.classList.add('active');

    this.currentStep = step;
  }
  goToNextStep(targetStep: number): void {
    const currentStepNumber = targetStep - 1;

    if (!this.validateCurrentStep(currentStepNumber)) {
      this.showValidationErrors(currentStepNumber);
      return;
    }

    this.errorMessage = '';
    this.goToStep(targetStep);
  }

  validateCurrentStep(step: number): boolean {
    switch (step) {
      case 1:
        return !!(
          this.registerForm.get('name')?.valid &&
          this.registerForm.get('email')?.valid
        );
      case 2:
        return !!(
          this.registerForm.get('speciality')?.valid &&
          this.registerForm.get('speciality')?.value
        );
      case 3:
        return !!(
          this.registerForm.get('username')?.valid &&
          this.registerForm.get('password')?.valid &&
          this.registerForm.get('password')?.value ===
            this.registerForm.get('confirmpassword')?.value
        );
      case 4:
        return true;
      default:
        return true;
    }
  }

  showValidationErrors(step: number): void {
    const errors: string[] = [];

    switch (step) {
      case 1:
        if (!this.registerForm.get('name')?.valid)
          errors.push('Le nom complet est requis');
        if (!this.registerForm.get('email')?.valid)
          errors.push('Un email valide est requis');
        break;
      case 2:
        if (!this.registerForm.get('speciality')?.value)
          errors.push('La spécialité est requise');
        if (!this.registerForm.get('licence')?.value)
          errors.push('La licence est requise');
        break;
      case 3:
        if (!this.registerForm.get('username')?.valid)
          errors.push("Le nom d'utilisateur est requis");
        if (!this.registerForm.get('password')?.valid)
          errors.push('Le mot de passe doit contenir au moins 8 caractères');
        if (
          this.registerForm.get('password')?.value !==
          this.registerForm.get('confirmpassword')?.value
        )
          errors.push('Les mots de passe ne correspondent pas');
        break;
    }

    if (errors.length > 0) {
      this.errorMessage = errors.join(' • ');
    }
  }

  Register(): void {
    this.errorMessage  = '';
    this.successMessage = '';

    // Validation finale complète
    if (!this.validateCurrentStep(1) ||
        !this.validateCurrentStep(2) ||
        !this.validateCurrentStep(3)) {
      this.errorMessage = 'Veuillez remplir correctement tous les champs obligatoires.';
      return;
    }

    this.isLoading = true;

    const registerData = {
      ...this.registerForm.value,
      creneaux: this.creneaux.value,
    };

    this.jwtService.registerDoc(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('✅ Inscription réussie:', response);
        // ← Passer directement à l'étape OTP sans goToStep()
        // car currentStep 5 est géré par *ngIf, pas par DOM
        this.currentStep = 5;
        this.errorMessage = '';
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Erreur inscription:', error);

        const errorMsg = error.error?.message || error.error || '';
        const msg = typeof errorMsg === 'string' ? errorMsg : 'Erreur lors de l\'inscription.';

        // ← NE PAS appeler goToStep() ici pour ne pas reset le formulaire
        if (msg.includes("nom d'utilisateur") || msg.includes('username')) {
          this.errorMessage = "Ce nom d'utilisateur est déjà utilisé. Modifiez-le à l'étape 3.";
          // Rester à l'étape 4, afficher l'erreur en haut
        } else if (msg.includes('email')) {
          this.errorMessage = 'Cet email est déjà utilisé. Modifiez-le à l\'étape 1.';
        } else if (error.status === 400) {
          this.errorMessage = 'Données invalides. Vérifiez tous les champs et réessayez.';
        } else {
          this.errorMessage = msg || 'Erreur lors de l\'inscription. Réessayez.';
        }
      },
    });
  }

  activateAccount(): void {
    this.errorMessage   = '';
    this.successMessage = '';

    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const code = this.otpForm.get('code')?.value;

    this.docteurService.activateAccount({ code }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Compte activé avec succès ! Redirection...';
        setTimeout(() => this.router.navigateByUrl('/DocLogin'), 1800);
      },
      error: (error) => {
        this.isLoading = false;
        const msg = error.error?.message || error.error || '';
        if (typeof msg === 'string' && msg.includes('expiré')) {
          this.errorMessage = 'Code expiré. Veuillez vous réinscrire.';
        } else {
          this.errorMessage = 'Code invalide. Vérifiez votre email et réessayez.';
        }
      },
    });
  }


  renvoyerCode(): void {
    this.errorMessage   = '';
    this.successMessage = '';

    // Relancer l'inscription pour générer un nouveau code
    const email = this.registerForm.get('email')?.value;
    if (!email) {
      this.errorMessage = 'Email introuvable. Retournez au formulaire.';
      return;
    }

    this.isLoading = true;
    const registerData = {
      ...this.registerForm.value,
      creneaux: this.creneaux.value,
    };

    this.jwtService.registerDoc(registerData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Un nouveau code a été envoyé à votre email.';
        this.otpForm.reset();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Impossible de renvoyer le code. Réessayez.';
      },
    });
  }

  // ── Utilitaires ───────────────────────────────────────────────
  setupPasswordToggles(): void {
    document.querySelectorAll('.password-toggle').forEach(toggle => {
      toggle.addEventListener('click', function (this: HTMLElement) {
        const field = this.previousElementSibling as HTMLInputElement;
        if (field && field.type) {
          field.type = field.type === 'password' ? 'text' : 'password';
        }
      });
    });
  }
}
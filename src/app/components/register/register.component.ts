import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, 
         ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { JwtService } from '../../_helps/jwt/jwt.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  // ✅ Deux étapes : inscription → OTP
  currentStep: 'register' | 'otp' = 'register';

  registerForm!: FormGroup;
  otpForm!: FormGroup;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private readonly jwtService: JwtService,
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username:        ['', [Validators.required]],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(8),
                             this.passwordValidator]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });

    // ✅ Formulaire OTP : 6 chiffres
    this.otpForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6),
                  Validators.maxLength(6), Validators.pattern(/^\d{6}$/)]]
    });
  }

  // ── Étape 1 : Inscription ──────────────────────────────────────────────

  Register(): void {
    this.errorMessage = '';
    this.successMessage = '';

    Object.keys(this.registerForm.controls).forEach(key =>
      this.registerForm.get(key)?.markAsTouched()
    );

    if (this.registerForm.invalid) {
      if (this.registerForm.errors?.['passwordMismatch']) {
        this.errorMessage = 'Les mots de passe ne correspondent pas.';
      } else {
        this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      }
      return;
    }

    this.isLoading = true;

    const registerData = {
      username: this.registerForm.get('username')?.value?.trim(),
      email:    this.registerForm.get('email')?.value?.trim(),
      password: this.registerForm.get('password')?.value,
    };

    this.jwtService.register(registerData).subscribe({
      next: (response) => {
        console.log('✅ Inscription réussie:', response);
        this.isLoading = false;
        this.successMessage = 'Compte créé ! Vérifiez votre email pour le code OTP.';
        this.currentStep = 'otp';           // ✅ Passer à l'étape OTP
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Erreur inscription:', error);

        if (error.status === 400) {
          // ✅ Gère le cas "OTP renvoyé" du backend
          const msg = error.error?.message || error.error || '';
          if (typeof msg === 'string' && msg.includes('code de validation')) {
            this.successMessage = msg;
            this.currentStep = 'otp';       // ✅ Aller quand même à l'OTP
          } else {
            this.errorMessage = msg || 'Données invalides.';
          }
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur.';
        } else {
          this.errorMessage = error.error?.message || 'Une erreur est survenue.';
        }
      }
    });
  }

  // ── Étape 2 : Activation OTP ───────────────────────────────────────────

  activateAccount(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.otpForm.invalid) {
      this.errorMessage = 'Veuillez entrer un code valide à 6 chiffres.';
      return;
    }

    this.isLoading = true;

    const code = this.otpForm.get('code')?.value?.trim();

    // ✅ Appel POST /signup/code-activation avec { "code": "123456" }
    this.jwtService.activateAccount({ code }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Compte activé avec succès !';
        setTimeout(() => this.router.navigateByUrl('/connex'), 1500);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Erreur activation:', error);

        if (error.status === 400) {
          const msg = error.error || error.error?.message || '';
          if (typeof msg === 'string' && msg.includes('expiré')) {
            this.errorMessage = 'Code expiré. Réinscrivez-vous pour recevoir un nouveau code.';
          } else {
            this.errorMessage = 'Code invalide. Vérifiez votre email.';
          }
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur.';
        } else {
          this.errorMessage = error.error?.message || 'Erreur lors de l\'activation.';
        }
      }
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
  }

  // ── Utilitaires ────────────────────────────────────────────────────────

  togglePasswordVisibility(): void      { this.showPassword = !this.showPassword; }
  toggleConfirmPasswordVisibility(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password        = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(control.value) ? null : { invalidPassword: true };
  }

  get username()        { return this.registerForm.get('username'); }
  get password()        { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get code()            { return this.otpForm.get('code'); }
}
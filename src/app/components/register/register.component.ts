import { Component, Injectable, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { JwtService } from '../../_helps/jwt/jwt.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  componentToShow: string = "welcome";
  registerForm: FormGroup = new FormGroup({});
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private readonly jwtService: JwtService,
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]], // Initialisé avec une chaîne vide
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });

    // DÉBOGAGE: Écouter les changements sur le champ gender
    this.registerForm.get('gender')?.valueChanges.subscribe(value => {
      console.log('Gender changed ->', value, 'typeof ->', typeof value);
    });
  }

  passwordMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  emailValidator(control: AbstractControl): ValidationErrors | null {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(control.value) ? null : { invalidEmail: true };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  testGenderChange(event: any) {
    console.log('SELECT CHANGED:', event.target.value);
    this.registerForm.patchValue({ gender: event.target.value });
  }

  Register(): void {
    console.log('🚀 Tentative d\'inscription...');
    
    // Marquer tous les champs comme touchés pour afficher les erreurs
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });

  

    // Vérifier que le formulaire est valide
    if (this.registerForm.invalid) {
      console.error('❌ Formulaire invalide');
      console.error('Erreurs du formulaire:', this.registerForm.errors);
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          console.error(`❌ Champ ${key} invalide:`, control.errors, 'Valeur:', control.value);
        }
      });
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }

    // Créer l'objet à envoyer (sans confirmPassword)
    const registerData = {
      username: this.registerForm.get('username')?.value?.trim(),
      email: this.registerForm.get('email')?.value?.trim(),
      password: this.registerForm.get('password')?.value,
      // gender: this.registerForm.get('gender')?.value
    };

    console.log('📤 Données envoyées au backend:', registerData);

    // Vérification finale avant envoi
    // if (!registerData.gender || registerData.gender === '') {
    //   console.error('❌ ERREUR: Gender est vide avant envoi!');
    //   alert('Veuillez sélectionner votre sexe');
    //   return;
    // }

    this.jwtService.register(registerData).subscribe(
      response => {
        console.log('✅ Réponse du serveur:', response);
        alert('Inscription réussie !');
        this.router.navigateByUrl('connex');
      },
      error => {
        console.error('❌ Erreur complète:', error);
        if (error.status === 400) {
          alert(error.error.message || 'Données invalides');
        } else if (error.status === 409) {
          alert('Cet email ou nom d\'utilisateur existe déjà');
        } else if (error.status === 0) {
          alert('Impossible de se connecter au serveur. Vérifiez votre connexion.');
        } else {
          alert('Une erreur est survenue lors de l\'inscription: ' + (error.error?.message || error.message));
        }
      }
    );
  }
  
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    // Exemple de validation : au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(control.value) ? null : { invalidPassword: true };
  }

  get username() {
    return this.registerForm.get('username');
  }

  get password() {
    return this.registerForm.get('password');
  }
}
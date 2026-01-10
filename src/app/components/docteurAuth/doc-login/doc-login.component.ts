import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { JwtService } from '../../../_helps/jwt/jwt.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-doc-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './doc-login.component.html',
  styleUrl: './doc-login.component.css'
})
export class DocLoginComponent implements OnInit {
  componentToShow: string = "welcome";
  loginForm!: FormGroup;
  userName: string | null = null;
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private jwtService: JwtService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    
    // Récupérer le nom de l'utilisateur s'il est déjà connecté
    this.userName = this.jwtService.getUserName();
  }

  /**
   * Soumission du formulaire DOCTEUR
   */
  submitForm(): void {
    // Réinitialiser le message d'erreur
    this.errorMessage = '';
    
    // Marquer tous les champs comme touchés
    this.markFormGroupTouched(this.loginForm);

    // Validation du formulaire
    if (this.loginForm.invalid) {
      if (this.username?.errors?.['required']) {
        this.errorMessage = 'Le nom d\'utilisateur est requis.';
        return;
      }
      
      if (this.username?.errors?.['minlength']) {
        this.errorMessage = 'Le nom d\'utilisateur doit contenir au moins 3 caractères.';
        return;
      }
      
      if (this.password?.errors?.['required']) {
        this.errorMessage = 'Le mot de passe est requis.';
        return;
      }
      
      if (this.password?.errors?.['minlength']) {
        this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
        return;
      }
      
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire.';
      return;
    }

    this.isLoading = true;
    const credentials = this.loginForm.value;

    console.log('📤 Envoi des credentials DOCTOR:', { username: credentials.username });

    // ✅ APPEL DE loginDoc() QUI ENVOIE AUTOMATIQUEMENT role="DOCTOR"
    this.jwtService.loginDoc(credentials)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log("✅ Réponse du backend:", response);
          
          if (response && response.jwt) {
            // Le token est déjà sauvegardé par le service
            this.userName = this.jwtService.getUserName();
            this.errorMessage = '';

            console.log("🔑 Token stocké après connexion:", localStorage.getItem('jwtToken'));
            console.log("🎭 Rôle:", this.jwtService.getUserRole());
            
            // Redirection vers dashboard DOCTEUR
            this.router.navigateByUrl("/DocDash");
          } else {
            this.errorMessage = "Erreur : Aucun token reçu du serveur.";
            console.error("❌ Pas de token dans la réponse");
          }
        },
        error: (error) => {
          console.error('❌ Erreur de connexion docteur:', error);
          
          // ✅ GESTION DES ERREURS AMÉLIORÉE
          if (error.status === 403) {
            this.errorMessage = 'Ce compte n\'est pas un compte docteur. Utilisez la connexion utilisateur.';
          } else if (error.status === 401) {
            this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect.';
          } else if (error.status === 404) {
            this.errorMessage = 'Docteur non trouvé.';
          } else if (error.status === 0) {
            this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
          } else if (error.status === 429) {
            this.errorMessage = 'Trop de tentatives. Veuillez réessayer dans quelques minutes.';
          } else {
            this.errorMessage = error.error?.message || 'Erreur lors de la connexion.';
          }
        }
      });
  }

  /**
   * Afficher/masquer le mot de passe
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Validateur d'email (si nécessaire)
   */
  emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(control.value) ? null : { invalidEmail: true };
  }

  /**
   * Marque tous les champs comme touchés
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Getters pour accéder aux contrôles
   */
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  /**
   * Affichage des composants
   */
  showComponent(componentToShow: string): void {
    this.componentToShow = componentToShow;
  }

  /**
   * Déconnexion
   */
  logout(): void {
    this.jwtService.removeToken();
    this.userName = null;
    this.loginForm.reset();
    this.router.navigateByUrl("/connex");
  }
}
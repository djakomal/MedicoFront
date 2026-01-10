import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { JwtService } from '../../_helps/jwt/jwt.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './connexion.component.html',
  styleUrl: './connexion.component.css'
})
export class ConnexionComponent implements OnInit {
  componentToShow: string = "welcome";
  errorMessage: string = '';
  isloading: boolean = false;
  loginForm!: FormGroup;
  userName: string | null = null;
  showPassword: boolean = false;

  constructor(
    private jwtService: JwtService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initialisation du formulaire avec validateurs
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6), this.passwordValidator.bind(this)]],
    });

    // Récupérer le nom de l'utilisateur s'il est déjà connecté
    this.userName = this.jwtService.getUserName();
  }

  /**
   * Soumission du formulaire avec gestion d'erreur complète
   */
  submitForm(): void {
    // Réinitialiser le message d'erreur
    this.errorMessage = '';
    this.markFormGroupTouched(this.loginForm);
    
    // Validation du formulaire
    if (this.loginForm.invalid) {
      if (this.username?.errors?.['required']) {
        this.errorMessage = 'Le nom d\'utilisateur est requis.';
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
      
      if (this.password?.errors?.['invalidPassword']) {
        this.errorMessage = 'Le mot de passe n\'est pas valide.';
        return;
      }
      
      if (this.username?.errors?.['invalidUsername']) {
        this.errorMessage = 'Le nom d\'utilisateur n\'est pas valide.';
        return;
      } 
      
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire.';
      return;
    }

    // Désactiver le bouton pendant le chargement
    this.isloading = true;

    const credentials = this.loginForm.value;
    
    console.log('📤 Envoi des credentials USER:', { username: credentials.username });

    //  APPEL DE login() QUI ENVOIE AUTOMATIQUEMENT role="USER"
    this.jwtService.login(credentials)
      .pipe(
        finalize(() => {
          this.isloading = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('✅ Réponse du backend:', response);
          
          if (response && response.jwt) {
            // Le token est déjà sauvegardé par le service
            this.userName = this.jwtService.getUserName();
            this.errorMessage = '';
            
            console.log('🔑 Token stocké:', localStorage.getItem('jwtToken'));
            console.log('🎭 Rôle:', this.jwtService.getUserRole());

            // Redirection vers dashboard USER
            this.router.navigateByUrl('/UserDah');
          } else {
            this.errorMessage = 'Erreur : Aucun token reçu du serveur.';
            console.error('❌ Pas de token dans la réponse');
          }
        },
        error: (error) => {
          console.error('❌ Erreur de connexion:', error); 
          
          // ✅ GESTION DES ERREURS AMÉLIORÉE
          if (error.status === 403) {
            this.errorMessage = 'Ce compte n\'est pas un compte utilisateur. Utilisez la connexion docteur.';
          } else if (error.status === 401) {
            this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect.';
          } else if (error.status === 404) {
            this.errorMessage = 'Utilisateur non trouvé.';
          } else if (error.status === 0) {
            this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
          } else if (error.status === 429) {
            this.errorMessage = 'Trop de tentatives. Veuillez réessayer dans quelques minutes.';
          } else {
            this.errorMessage = error.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
          }
        }
      });
  }
  
  /**
   * Afficher/masquer le mot de passe
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = this.showPassword ? 'text' : 'password';
    }
  }

  /**
   * Validateur de username personnalisé
   */
  useranameValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const usernameRegex = /^[^\s]{3,}$/;
    return usernameRegex.test(control.value) ? null : { invalidUsername: true };
  }

  /**
   * Validateur de mot de passe
   */
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(control.value) ? null : { invalidPassword: true };  
  }

  /**
   * Marque tous les champs comme touchés pour afficher les erreurs
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
   * Getters pour faciliter l'accès aux contrôles dans le template
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
    this.router.navigateByUrl('/connex');
  }
}
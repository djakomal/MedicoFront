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

  constructor(
    private jwtService: JwtService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    // ✅ Initialisation du formulaire avec validateurs
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // ✅ Récupérer le nom de l'utilisateur s'il est déjà connecté
    this.userName = this.jwtService.getUserName();
  }

  /**
   * ✅ Soumission du formulaire avec gestion d'erreur complète
   */
  submitForm(): void {
    // Réinitialiser le message d'erreur
    this.errorMessage = '';

    // Validation du formulaire
    if (this.loginForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    // Désactiver le bouton pendant le chargement
    this.isloading = true;

    const credentials = this.loginForm.value;
    
    console.log('📤 Envoi des credentials:', { username: credentials.username });

    this.jwtService.login(credentials)
      .pipe(
        finalize(() => {
          // ✅ IMPORTANT : Remettre isloading à false dans tous les cas
          this.isloading = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('✅ Réponse du backend:', response);

          if (response && response.jwt) {
            // Sauvegarder le token (une seule fois)
            this.jwtService.saveToken(response.jwt);
            
            // Récupérer le nom d'utilisateur
            this.userName = this.jwtService.getUserName();
            
            console.log('🔑 Token stocké:', localStorage.getItem('jwtToken'));

            // Redirection
            this.router.navigateByUrl('/UserDah');
          } else {
            this.errorMessage = 'Erreur : Aucun token reçu du serveur.';
            console.error('❌ Pas de token dans la réponse');
          }
        },
        error: (error) => {
          console.error('❌ Erreur de connexion:', error);
          
          // Gestion des différents codes d'erreur
          if (error.status === 401) {
            this.errorMessage = 'Email ou mot de passe incorrect.';
          } else if (error.status === 404) {
            this.errorMessage = 'Utilisateur non trouvé.';
          } else if (error.status === 403) {
            this.errorMessage = 'Compte désactivé.';
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
   * ✅ Validateur d'email personnalisé
   */
  emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(control.value) ? null : { invalidEmail: true };
  }

  /**
   * ✅ Marque tous les champs comme touchés pour afficher les erreurs
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
   * ✅ Getters pour faciliter l'accès aux contrôles dans le template
   */
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  /**
   * ✅ Affichage des composants
   */
  showComponent(componentToShow: string): void {
    this.componentToShow = componentToShow;
  }

  /**
   * ✅ Déconnexion
   */
  logout(): void {
    this.jwtService.removeToken();
    this.userName = null;
    this.loginForm.reset();
    this.router.navigateByUrl('/connex');
  }
}
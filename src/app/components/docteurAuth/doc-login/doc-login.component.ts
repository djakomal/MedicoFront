import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { JwtService } from '../../../_helps/jwt/jwt.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doc-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './doc-login.component.html',
  styleUrl: './doc-login.component.css'
})
export class DocLoginComponent  implements OnInit {
  componentToShow: string = "welcome";
  
    loginForm: FormGroup = new FormGroup({});
    userName: string | null = null; // Stocke le nom de l'utilisateur
    
  
    constructor(
      private jwtService: JwtService,
      private fb: FormBuilder,
      private router: Router
    ) { }
  
    ngOnInit(): void {
      this.loginForm = this.fb.group({
        email: ['', Validators.required, Validators.email],
        password: ['', Validators.required],
      });
        // Récupérer le nom de l'utilisateur s'il est déjà connecté
        this.userName = this.jwtService.getUserName();
    }
    submitForm(): void {
      const credentials = this.loginForm.value;
    
      this.jwtService.login(credentials).subscribe(
        (response: any) => {
          console.log("reponse du backend ",response);  // Affiche la réponse complète
          if (response && response.jwt) {
            this.jwtService.saveToken(response.jwt);
            this.userName = this.jwtService.getUserName();
            console.log("🔑 Token stocké après connexion:", localStorage.getItem('jwtToken'));  // Sauvegarde le token
            alert('Connexion réussie !');
            localStorage.setItem('token', response.jwt);
            this.router.navigateByUrl("/UserDah");
          } else {
            alert("Erreur : Aucun token reçu !");
          }
        },
        (error) => {
          alert('Échec de la connexion');
          console.error(error);
        }
      );
    }
      emailValidator(control: AbstractControl): ValidationErrors | null {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          return emailRegex.test(control.value) ? null : { invalidEmail: true };
        }
    
    
    showComponent(componentToShow: string): void {
      this.componentToShow = componentToShow;
    }
    logout(): void {
      this.jwtService.removeToken();
      this.userName = null; // Supprime le nom affiché
      this.router.navigateByUrl("/connex"); // Redirection vers la page de connexion
    }
  

}

import { DocteurService } from './../../../../_helps/Docteur/docteur.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { JwtService } from '../../../../_helps/jwt/jwt.service';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profileComponent.component.html',
  styleUrls: ['./profileComponent.component.css']
})
export class ProfileComponent implements OnInit {
  usernameForm!: FormGroup;
  passwordForm!: FormGroup;
  userName: string = '';
  email: string = '';
  role:string='';
  

  isEditingUsername = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private jwtService: JwtService,
    private docteurService: DocteurService,
    
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initUsernameForm();
    this.initPasswordForm();
    this.loadUserName();
    this.loadEmail();
    this.loadRole();  }




  initUsernameForm(): void {
    this.usernameForm = this.fb.group({
      username: [this.userName, [Validators.required, Validators.minLength(3)]]
    });
    this.usernameForm.disable();
  }

  initPasswordForm(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  toggleEditUsername(): void {
    this.isEditingUsername = !this.isEditingUsername;
    
    if (this.isEditingUsername) {
      this.usernameForm.enable();
    } else {
      this.usernameForm.disable();
      this.usernameForm.patchValue({ username: this.userName });
    }
    this.clearMessages();
  }

  onUsernameSubmit(): void {
    if (this.usernameForm.invalid) {
      this.markFormGroupTouched(this.usernameForm);
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    const newUsername = this.usernameForm.value.username;

    // Simuler un appel API - Remplacez par votre service
    // this.authService.updateUsername(newUsername).subscribe({...})
    setTimeout(() => {
      this.userName = newUsername;
      this.successMessage = 'Nom d\'utilisateur modifié avec succès !';
      this.isSubmitting = false;
      this.isEditingUsername = false;
      this.usernameForm.disable();

      setTimeout(() => this.successMessage = '', 3000);
    }, 1000);
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    // Simuler un appel API - Remplacez par votre service
    // this.authService.changePassword(this.passwordForm.value).subscribe({...})
    setTimeout(() => {
      this.successMessage = 'Mot de passe modifié avec succès !';
      this.isSubmitting = false;
      this.passwordForm.reset();

      setTimeout(() => this.successMessage = '', 3000);
    }, 1000);
  }


  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  hasError(formGroup: FormGroup, fieldName: string, errorType: string): boolean {
    const field = formGroup.get(fieldName);
    return field ? field.touched && field.hasError(errorType) : false;
  }

  getInitials(): string {
    return this.userName.substring(0, 2).toUpperCase();
  }

  loadUserName(): void {
    const decodedToken = this.jwtService.getDecodedToken();
    this.userName = this.jwtService.getUserName() || '';
    
    if (this.userName.includes('@')) {
      this.userName = this.userName.split('@')[0];
    }
  }
   loadEmail(): void {
    const decodedToken = this.jwtService.getDecodedToken();
    this.email = this.jwtService.getEmail() || '';
    // Le email en entier
    if (this.email.includes('@')) {
      this.email = this.email.split('@')[0];
    }
    // sans les @
    // if (this.email) {
    //   this.userName = this.email;
    // }
  }

  loadRole():void{
    const decodedToken = this.jwtService.getDecodedToken();
    this.role = this.jwtService.getUserRole() || '';
    const role = decodedToken ? decodedToken['role'] : '';
    console.log('Type de rôle chargé :', this.role )
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      console.log('Déconnexion en cours...');
      
      // Nettoyer localStorage et sessionStorage
      this.jwtService.removeToken();
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      sessionStorage.clear();
      
      // Rediriger vers la page de connexion appropriée
      const role = this.jwtService.getUserRole();
      
      if (role === 'DOCTOR') {
        this.router.navigate(['/connexDoc']);
      } else {
        this.router.navigate(['/connex']);
      }
      
      console.log(' Déconnexion réussie');
    }
  }




}

import { DocteurService } from './../../../../_helps/Docteur/docteur.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { JwtService } from '../../../../_helps/jwt/jwt.service';

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

  userName  = '';
  email     = '';
  role      = '';

  isEditingUsername = false;
  isSubmitting      = false;
  isLoading         = false;  // ✅ ajouté
  successMessage    = '';
  errorMessage      = '';

  constructor(
    private jwtService: JwtService,
    private docteurService: DocteurService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadUserName();
    this.loadEmail();
    this.loadRole();
  }

  initForms(): void {
    this.usernameForm = this.fb.group({
      username: [this.userName, [Validators.required, Validators.minLength(3)]]
    });
    this.usernameForm.disable();

    // ✅ Noms alignés avec le backend ET le HTML
    this.passwordForm = this.fb.group({
      ancienMotDePasse:  ['', [Validators.required]],
      nouveauMotDePasse: ['', [Validators.required, Validators.minLength(8)]],
      confirmation:      ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const nouveau = group.get('nouveauMotDePasse')?.value;
    const confirm = group.get('confirmation')?.value;
    return nouveau === confirm ? null : { mismatch: true };
  }

  // ✅ Méthode unique pour changer le mot de passe via le backend
  onPasswordSubmit(): void {
    this.successMessage = '';
    this.errorMessage   = '';

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.jwtService.changePasswordDocteur(this.passwordForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Mot de passe modifié avec succès !';
        this.passwordForm.reset();
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error || 'Erreur lors de la modification.';
      }
    });
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
      this.usernameForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.clearMessages();

    setTimeout(() => {
      this.userName = this.usernameForm.value.username;
      this.successMessage = "Nom d'utilisateur modifié avec succès !";
      this.isSubmitting = false;
      this.isEditingUsername = false;
      this.usernameForm.disable();
      setTimeout(() => this.successMessage = '', 3000);
    }, 1000);
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage   = '';
  }

  hasError(formGroup: FormGroup, fieldName: string, errorType: string): boolean {
    const field = formGroup.get(fieldName);
    return field ? field.touched && field.hasError(errorType) : false;
  }

  getInitials(): string {
    return this.userName.substring(0, 2).toUpperCase();
  }

  loadUserName(): void {
    this.userName = this.jwtService.getUserName() || '';
    if (this.userName.includes('@')) this.userName = this.userName.split('@')[0];
  }

  loadEmail(): void {
    this.email = this.jwtService.getEmail() || '';
  }

  loadRole(): void {
    this.role = this.jwtService.getUserRole() || '';
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.jwtService.removeToken();
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      sessionStorage.clear();
      this.router.navigate(['/connexDoc']);
    }
  }
}
import { Component,  Injectable,  OnInit } from '@angular/core';
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
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  componentToShow: string = "welcome";
  registerForm: FormGroup = new FormGroup({});

  constructor(
    private jwtService: JwtService,
    private fb: FormBuilder,
    private router: Router

  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['',[Validators.required]],
      gender:['',[Validators.required]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validator: this.passwordMatchValidator })
  }

  passwordMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
    // Vérificateur d'e-mail
    emailValidator(control: AbstractControl): ValidationErrors | null {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(control.value) ? null : { invalidEmail: true };
    }
  

  
  // submitForm() {
  //   const formData = this.registerForm.value;

  //   this.jwtService.register(formData).subscribe(
  //     response => {
  //       alert('Inscription réussie !');
  //       this.router.navigateByUrl('connex');
  //     },
  //     error => {
  //       if (error.status === 400) {
  //         alert(error.error.message); // Affiche le message d'erreur du backend
  //       } else {
  //         alert('Une erreur est survenue lors de l\'inscription.');
  //       }
  //     }
  //   );
  // }
  Register(): void {
    const register = this.registerForm.value;
  
    this.jwtService.register(register).subscribe(
      response => {
        alert('Inscription réussie !');
        this.router.navigateByUrl('connex');
      },
      error => {
        if (error.status === 400) {
          alert(error.error.message); // Affiche le message d'erreur du backend
        } else {
          alert('Une erreur est survenue lors de l\'inscription.');
        }
      }
    );
  }
  


}
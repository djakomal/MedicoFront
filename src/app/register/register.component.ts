import { Component,  Injectable,  OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { JwtService } from '../_helps/jwt.service';
import { Router } from '@angular/router';


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
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    }, { validator: this.passwordMathValidator })
  }

  passwordMathValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    if (password != confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }
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
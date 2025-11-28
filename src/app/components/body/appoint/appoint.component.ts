import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { AppointTypeServiceService } from '../../../_helps/appointment/appoint-type-service.service';

import { AppoitementType } from '../../../models/appoitementType';
import { AppointementService } from '../../../_helps/appointment/appointement.service';
import { Appoitement } from '../../../models/appoitement';
import { Docteur } from '../../../models/docteur';
import { JwtService } from '../../../_helps/jwt/jwt.service';

@Component({
  selector: 'app-appoint',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './appoint.component.html',
  styleUrl: './appoint.component.css'
})
export class AppointComponent  implements OnInit {
   appointmentForm: FormGroup;
  currentStep = 1;
   doctors: Docteur[] = [];

  isSubmitting = false;
  submitError = '';
  submitSuccess = false;
  
  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointementService,
    private jwtService: JwtService
  ) {
    this.appointmentForm = this.fb.group({
      // Étape 1: Informations personnelles
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      birthdate: ['', Validators.required],
      gender: [null, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      insurance: [''],
      
      // Étape 2: Détails du rendez-vous
      doctorType: ['', Validators.required],
      otherSpecialist: [''],
      doctorId: [null],
      appointmentType: ['', Validators.required],
      preferredDate: ['', Validators.required],
      preferredTime: ['', Validators.required],
      altAvailability: this.fb.group({
        morning: [false],
        afternoon: [false],
        evening: [false]
      }),
      
      // Informations médicales
      reason: ['', Validators.required],
      symptoms: [''],
      firstVisit: [''],
      allergies: [''],
      medications: [''],
      
      // Informations complémentaires
      additionalInfo: [''],
      consent: [false, Validators.requiredTrue]
    });
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
    this.loadDoctors();
  }
  
  // Méthodes pour la navigation entre les étapes
  nextStep(): void {
    // Validation de l'étape 1 avant de passer à l'étape 2
    if (this.currentStep === 1) {
      const step1Controls = ['firstname', 'lastname', 'birthdate', 'gender', 'email', 'phone'];
      
      // Marquer tous les champs comme touchés pour afficher les erreurs
      step1Controls.forEach(control => {
        this.appointmentForm.get(control)?.markAsTouched();
        // Rafraîchir la validation au cas où
        this.appointmentForm.get(control)?.updateValueAndValidity();
      });
      
      // Log pour débogage
      console.log('Gender value:', this.appointmentForm.get('gender')?.value);
      console.log('Gender valid:', this.appointmentForm.get('gender')?.valid);
      console.log('Gender errors:', this.appointmentForm.get('gender')?.errors);
      
      // Si gender est rempli mais toujours marqué comme invalide, forcer sa validité
      const genderControl = this.appointmentForm.get('gender');
      if (genderControl?.value && !genderControl.valid) {
        console.log('Forçage de la validité du champ gender');
        // Vous pouvez utiliser cette approche de force en dernier recours
        // genderControl.setErrors(null);
      }
      
      // Vérifier si tous les champs requis sont valides
      const step1Valid = step1Controls.every(control => {
        const isValid = this.appointmentForm.get(control)?.valid;
        console.log(`${control} is valid:`, isValid);
        return isValid;
      });
      
      console.log('Formulaire étape 1 valide:', step1Valid);
      
      if (step1Valid) {
        this.currentStep = 2;
      }
    }
  }

   previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
    isFieldValid(fieldName: string): boolean {
    const field = this.appointmentForm.get(fieldName);
    return field ? !(field.invalid && field.touched) : true;
  }
   hasError(fieldName: string, errorType: string): boolean {
    const field = this.appointmentForm.get(fieldName);
    return field ? field.touched && field.hasError(errorType) : false;
  }
  
    onGenderChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;
    
    console.log('Gender changed to:', value);
    
    // Mise à jour manuelle de la valeur et forçage de la validation
    if (value) {
      this.appointmentForm.get('gender')?.setValue(value);
      this.appointmentForm.get('gender')?.updateValueAndValidity();
    }
  }

    loadDoctors(): void {
    this.jwtService.getAllDocteurs().subscribe(
      (data: Docteur[]) => {
        this.doctors = data;
      },
      error => {
        console.error('Erreur lors du chargement des médecins', error);
      }
    );
  }
  // Méthode pour la soumission du formulaire
  onSubmit(): void {
       const formValue = this.appointmentForm.value;
    if (this.appointmentForm.valid) {
      console.log('Formulaire soumis:', this.appointmentForm.value);
      // Ici, envoyer les données au service approprié
      this.appointmentService.addAppoitement(this.appointmentForm.value).subscribe(
        response => {
          console.log('Réponse du serveur:', response);
          alert('Rendez-vous créé avec succès !');
          this.appointmentForm.reset(); // Réinitialiser le formulaire après
        },
        error => {
          if(error.status === 400) {
            alert(error.error.message); // Affiche le message d'erreur du backend
          console.error('Erreur lors de la soumission du formulaire:', error);
          }else{
            alert('Erreur lors de la soumission du formulaire: ' + error.message);
          }
        
          this.submitSuccess = true;
          this.submitError = '';
          this.isSubmitting = false;
          alert('Rendez-vous créé avec succès !');
        }
      );
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.appointmentForm.controls).forEach(key => {
        const control = this.appointmentForm.get(key);
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(subKey => {
            control.get(subKey)?.markAsTouched();
          });
        } else {
          control?.markAsTouched();
        }
      });
    }
     if (formValue.doctor === 'any') {
        formValue.doctor = null; // ou une valeur spéciale selon votre logique métier
      }
  }
  
  // Méthode utilitaire pour marquer tous les champs comme touchés (pour afficher les erreurs)
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  
  // Méthode pour afficher le champ spécialiste si "Autre spécialiste" est sélectionné
  showOtherSpecialist() {
    return this.appointmentForm.get('doctorType')?.value === 'other';
  }
}
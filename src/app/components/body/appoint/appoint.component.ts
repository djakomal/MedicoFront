import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { AppointTypeServiceService } from '../../../_helps/appointment/appoint-type-service.service';

import { AppoitementType } from '../../../models/appoitementType';
import { AppointementService } from '../../../_helps/appointment/appointement.service';
import { Appoitement } from '../../../models/appoitement';

@Component({
  selector: 'app-appoint',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './appoint.component.html',
  styleUrl: './appoint.component.css'
})
export class AppointComponent {
   appointmentForm: FormGroup;
  currentStep = 1;
  isSubmitting = false;
  submitError = '';
  submitSuccess = false;
  
  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointementService
  ) {
    this.appointmentForm = this.fb.group({
      // Étape 1: Informations personnelles
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      birthdate: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      insurance: [''],
      
      // Étape 2: Détails du rendez-vous
      doctorType: ['', Validators.required],
      otherSpecialist: [''],
      doctor: [''],
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
  
  // Méthodes pour la navigation entre les étapes
  nextStep() {
    // Vérification de la validité des champs de l'étape 1 avant de passer à l'étape 2
    const step1Controls = ['firstname', 'lastname', 'birthdate', 'gender', 'email', 'phone'];
    let valid = true;
    
    step1Controls.forEach(controlName => {
      const control = this.appointmentForm.get(controlName);
      if (control?.invalid) {
        control.markAsTouched();
        valid = false;
      }
    });
    
    if (valid) {
      this.currentStep = 2;
      // Scroll to top for better UX
      window.scrollTo(0, 0);
    }
  }
  
  previousStep() {
    this.currentStep = 1;
    // Scroll to top for better UX
    window.scrollTo(0, 0);
  }
  
  // Méthode pour la soumission du formulaire
  onSubmit() {
    if (this.appointmentForm.valid) {
      this.isSubmitting = true;
      this.submitError = '';
      
      // Construction de l'objet Appoitement à partir du formulaire
      const appointmentData: Appoitement = {
        ...this.appointmentForm.value,
        // Si doctorType n'est pas 'other', on ne garde pas otherSpecialist
        otherSpecialist: this.appointmentForm.value.doctorType === 'other' 
          ? this.appointmentForm.value.otherSpecialist 
          : undefined
      };
      
      this.appointmentService.addAppoitement(appointmentData).subscribe({
        next: (response) => {
          console.log('Rendez-vous enregistré avec succès:', response);
          this.isSubmitting = false;
          this.submitSuccess = true;
          
          // Réinitialisation du formulaire après 3 secondes
          setTimeout(() => {
            this.appointmentForm.reset();
            this.currentStep = 1;
            this.submitSuccess = false;
          }, 3000);
        },
        error: (error) => {
          console.error('Erreur lors de l\'enregistrement du rendez-vous:', error);
          this.isSubmitting = false;
          this.submitError = 'Une erreur est survenue lors de l\'enregistrement du rendez-vous. Veuillez réessayer.';
        }
      });
    } else {
      this.markFormGroupTouched(this.appointmentForm);
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

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
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './appoint.component.html',
  styleUrl: './appoint.component.css'
})
export class AppointComponent implements OnInit {
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
      gender: ['', Validators.required], // Changé de null à '' pour éviter les problèmes
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      insurance: [''],

      // Étape 2: Détails du rendez-vous
      doctorType: ['', Validators.required],
      otherSpecialist: [''],
      doctorId: [''], // Changé de null à ''
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
    this.loadDoctors();
  }

  // Méthodes pour la navigation entre les étapes
  nextStep(): void {
    if (this.currentStep === 1) {
      // Validation de l'étape 1
      const step1Controls = ['firstname', 'lastname', 'birthdate', 'gender', 'email', 'phone'];

      // Marquer tous les champs comme touchés
      step1Controls.forEach(control => {
        const field = this.appointmentForm.get(control);
        field?.markAsTouched();
        field?.updateValueAndValidity();
      });

      // Vérifier si tous les champs requis sont valides
      const step1Valid = step1Controls.every(control => {
        return this.appointmentForm.get(control)?.valid;
      });

      if (step1Valid) {
        this.currentStep = 2;
        // Scroll vers le haut du formulaire
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.log('Formulaire étape 1 invalide');
        // Afficher les erreurs
        step1Controls.forEach(control => {
          const field = this.appointmentForm.get(control);
          if (field?.invalid) {
            console.log(`${control} est invalide:`, field.errors);
          }
        });
      }
    } else if (this.currentStep === 2) {
      // Validation de l'étape 2
      const step2Controls = ['doctorType', 'appointmentType', 'preferredDate', 'preferredTime', 'reason'];

      // Marquer tous les champs comme touchés
      step2Controls.forEach(control => {
        const field = this.appointmentForm.get(control);
        field?.markAsTouched();
        field?.updateValueAndValidity();
      });

      // Si "Autre spécialiste" est sélectionné, ajouter la validation
      if (this.showOtherSpecialist() && !this.appointmentForm.get('otherSpecialist')?.value) {
        this.appointmentForm.get('otherSpecialist')?.setErrors({ required: true });
        this.appointmentForm.get('otherSpecialist')?.markAsTouched();
      }

      // Vérifier la validité
      const step2Valid = step2Controls.every(control => {
        return this.appointmentForm.get(control)?.valid;
      });

      const otherSpecialistValid = !this.showOtherSpecialist() || 
        (this.appointmentForm.get('otherSpecialist')?.value && 
         this.appointmentForm.get('otherSpecialist')?.value.trim() !== '');

      if (step2Valid && otherSpecialistValid) {
        // Pas d'étape 3 séparée dans votre cas, on reste sur l'étape 2
        console.log('Formulaire étape 2 valide');
      } else {
        console.log('Formulaire étape 2 invalide');
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      // Scroll vers le haut du formulaire
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

    if (value && value !== '') {
      this.appointmentForm.get('gender')?.setValue(value);
      this.appointmentForm.get('gender')?.markAsTouched();
      this.appointmentForm.get('gender')?.updateValueAndValidity();
    }
  }

  loadDoctors(): void {
    this.jwtService.getAllDocteurs().subscribe({
      next: (data: Docteur[]) => {
        this.doctors = data;
        console.log('Médecins chargés:', this.doctors);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des médecins:', error);
        this.submitError = 'Impossible de charger la liste des médecins';
      }
    });
  }

  // Méthode pour la soumission du formulaire
  onSubmit(): void {
    // Validation complète avant soumission
    if (!this.appointmentForm.valid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.markFormGroupTouched(this.appointmentForm);
      
      console.log('Formulaire invalide:', this.appointmentForm.errors);
      console.log('Champs invalides:');
      Object.keys(this.appointmentForm.controls).forEach(key => {
        const control = this.appointmentForm.get(key);
        if (control?.invalid) {
          console.log(`- ${key}:`, control.errors);
        }
      });

      this.submitError = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = false;

    // Préparer les données pour l'envoi
    const formValue = { ...this.appointmentForm.value };

    // Traiter le doctorId - si "N'importe quel médecin" est sélectionné
    if (!formValue.doctorId || formValue.doctorId === '' || formValue.doctorId === 'any') {
      formValue.doctorId = null;
    }

    // Traiter la date - s'assurer qu'elle est au bon format
    if (formValue.preferredDate) {
      formValue.preferredDate = new Date(formValue.preferredDate).toISOString();
    }

    console.log('Données à envoyer:', formValue);

    // Envoi au serveur
    this.appointmentService.addAppoitement(formValue).subscribe({
      next: (response) => {
        console.log('Réponse du serveur:', response);
        this.submitSuccess = true;
        this.submitError = '';
        this.isSubmitting = false;

        // Réinitialiser le formulaire
        this.appointmentForm.reset();
        this.currentStep = 1;

        // Afficher un message de succès
        alert('Votre demande de rendez-vous a été envoyée avec succès ! Nous vous contacterons sous peu.');
      },
      error: (error) => {
        console.error('Erreur lors de la soumission:', error);
        this.isSubmitting = false;
        this.submitSuccess = false;

        // Gestion des différents types d'erreurs
        if (error.status === 400) {
          this.submitError = error.error?.message || 'Données invalides. Veuillez vérifier le formulaire.';
        } else if (error.status === 401) {
          this.submitError = 'Vous devez être connecté pour prendre rendez-vous.';
        } else if (error.status === 409) {
          this.submitError = 'Ce créneau horaire n\'est plus disponible. Veuillez en choisir un autre.';
        } else if (error.status === 500) {
          this.submitError = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else {
          this.submitError = error.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
        }

        alert(this.submitError);
      }
    });
  }

  // Méthode utilitaire pour marquer tous les champs comme touchés
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Méthode pour afficher le champ spécialiste si "Autre spécialiste" est sélectionné
  showOtherSpecialist(): boolean {
    return this.appointmentForm.get('doctorType')?.value === 'other';
  }

  // Méthode utilitaire pour obtenir la date minimale (demain)
  getMinDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  // Méthode pour réinitialiser le formulaire
  resetForm(): void {
    this.appointmentForm.reset({
      gender: '',
      doctorId: '',
      consent: false
    });
    this.currentStep = 1;
    this.submitError = '';
    this.submitSuccess = false;
  }
}
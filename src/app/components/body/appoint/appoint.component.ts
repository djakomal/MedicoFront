import { ZoomMeeting } from './../../../_helps/appointment/ZOOM/ZoomSimpleService';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppoitementType } from '../../../models/appoitementType';
import { AppointementService } from '../../../_helps/appointment/appointement.service';
import { Appoitement } from '../../../models/appoitement';
import { Docteur } from '../../../models/docteur';
import { DocteurService } from '../../../_helps/Docteur/docteur.service';
import { CreneauService } from '../../../_helps/Creneau/Creneau.service';
import { Creneau } from '../../../models/Creneau';
import { debounceTime } from 'rxjs/operators';
import { Speciality } from '../../../models/speciality';
import { forkJoin } from 'rxjs';
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
  dateFilterControl = new FormControl('');
  currentStep = 1;
  showConfirmation = false;
  isLoadingCreneaux = false;
  doctors: Docteur[] = [];
  selectedDocteurId: number | null = null;

  creneauxDisponibles: Creneau[] = [];
  creneauxFiltres: Creneau[] = [];
  isSubmitting = false;
  submitError = '';
  submitSuccess = false;
  creneauLoadError = '';
  
  constructor(  
    private fb: FormBuilder,
    private appointmentService: AppointementService,
    private creneauService: CreneauService,
    private docteurService: DocteurService,
    private jwtService: JwtService ,
  ) {
    this.appointmentForm = this.fb.group({
      // Étape 1: Informations personnelles
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      birthdate: ['', Validators.required],
      gender: [null],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      insurance: [''],
      // Étape 2: Détails du rendez-vous
      doctorType: ['', Validators.required],
      otherSpecialist: [''],
      doctorId: [null, Validators.required],
      appointmentType: ['', Validators.required],
      preferredDate: [''],
      preferredTime: [''],
      creneauId: [null, Validators.required],
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
    this.loadAllDoctors();
    // Filtrer les créneaux par date
    this.dateFilterControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(date => {
        this.filtrerCreneauxParDate(date);
      });
    
    // Charger les créneaux quand le docteur change
    this.appointmentForm.get('doctorId')?.valueChanges.subscribe(doctorId => {
      this.dateFilterControl.setValue('', { emitEvent: false }); // Reset date filter
      this.creneauLoadError = '';
      this.appointmentForm.patchValue({ creneauId: null }, { emitEvent: false }); // Reset sans déclencher l'abonnement
      
      if (doctorId) {
        const doctorIdNumber = Number(doctorId);
        console.log('Médecin sélectionné, ID:', doctorId);
        this.chargerCreneauxDuMedecin(Number(doctorId));
      } else {
        // Réinitialiser si aucun médecin sélectionné
        this.creneauxDisponibles = [];
        this.creneauxFiltres = [];
      }
    });
    this.appointmentForm.get('creneauId')?.valueChanges.subscribe(creneauId => {
      // Ignorer les changements venant de réinitialisations internes
      if (!creneauId) {
        return;
      }

      const creneau = this.creneauxDisponibles.find(c => c.id === creneauId);
      if (!creneau) {
        console.warn('⚠️ Créneau introuvable:', creneauId);
        return;
      }

      // Mettre à jour la date et la période du créneau
      this.appointmentForm.patchValue({
        preferredDate: creneau.date,
        preferredTime: creneau.heureDebut
      });
    });
    

  }



  nextStep(): void {
    if (this.currentStep === 1) {
      const step1Controls = ['firstname', 'lastname', 'birthdate', 'gender', 'email', 'phone'];
      
      step1Controls.forEach(control => {
        this.appointmentForm.get(control)?.markAsTouched();
        this.appointmentForm.get(control)?.updateValueAndValidity();
      });
      
      const step1Valid = step1Controls.every(control => {
        return this.appointmentForm.get(control)?.valid;
      });
      
      if (step1Valid) {
        this.currentStep = 2;
      }
    }
  }

  previousStep(): void {
    if (this.currentStep === 3) {
      this.showConfirmation = false;
      this.currentStep = 2;
    } else if (this.currentStep > 1) {
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
    
    if (value) {
      this.appointmentForm.get('gender')?.setValue(value);
      this.appointmentForm.get('gender')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.markFormGroupTouched(this.appointmentForm);
      this.submitError = 'Veuillez remplir tous les champs requis correctement';
      return;
    }
  
    if (!this.appointmentForm.get('consent')?.value) {
      this.submitError = 'Vous devez accepter les conditions';
      return;
    }
  
    // Instead of submitting, show confirmation
    this.showConfirmation = true;
    this.currentStep = 3;
  }

  confirmSubmit(): void {
    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = '';
  
    const formValue = this.appointmentForm.value;
    const creneauId = formValue.creneauId;
  
    if (!formValue.doctorId || !formValue.creneauId) {
      this.submitError = 'Veuillez sélectionner un médecin et un créneau';
      this.isSubmitting = false;
      return;
    }
  
    const creneau = this.creneauxDisponibles.find(c => c.id === formValue.creneauId);
    if (!creneau) {
      this.submitError = 'Créneau introuvable';
      this.isSubmitting = false;
      return;
    }
  
    //  TOUT le code de soumission est DANS le next du subscribe
    this.creneauService.verifierDisponibilite(creneauId).subscribe({
      next: (disponibilite) => {
  
        //  Créneau plus disponible → stop
        if (!disponibilite.disponible) {
          this.submitError = 'Ce créneau n\'est plus disponible. Veuillez en sélectionner un autre.';
          this.isSubmitting = false;
          const doctorId = this.appointmentForm.get('doctorId')?.value;
          if (doctorId) this.chargerCreneauxDuMedecin(doctorId);
          return;
        }
        const userId = this.jwtService.getUserId();

          // Vérifier que l'utilisateur est connecté
          if (!userId) {
            console.error(' Utilisateur non connecté, impossible de créer le rendez-vous');
            this.submitError = 'Vous devez être connecté pour prendre un rendez-vous';
            this.isSubmitting = false;
            return;
          }
        const appointmentType: 'video' | 'presential' = 
          formValue.appointmentType === 'video' ? 'video' : 'presential';
        
        const appointmentData: Appoitement = {
          id: 0,
          firstname: formValue.firstname?.trim(),
          patientId: userId ,
          lastname: formValue.lastname?.trim(),
          birthdate: formValue.birthdate,
          gender: formValue.gender || 'other',
          email: formValue.email?.trim(),
          phone: formValue.phone?.trim(),
          insurance: formValue.insurance?.trim() || '',
          speciality: Speciality.GENERAL,
          doctorType: formValue.doctorType,
          otherSpecialist: formValue.otherSpecialist?.trim() || '',
          doctorId: formValue.doctorId,
          creneauId: formValue.creneauId,
          appointmentType: appointmentType,
          creneau:formValue.creneauId ? this.creneauxDisponibles.find((c: Creneau) => c.id === formValue.creneauId) : undefined,
          preferredDate: formValue.preferredDate,
          preferredTime: formValue.preferredTime,
          altAvailability: formValue.altAvailability,
          reason: formValue.reason?.trim(),
          symptoms: formValue.symptoms?.trim() || '',
          firstVisit: formValue.firstVisit || 'no',
          allergies: formValue.allergies?.trim() || '',
          medications: formValue.medications?.trim() || '',
          zoomMeetingId: formValue.ZoomMeetingId?.trim() || '',
          additionalInfo: formValue.additionalInfo?.trim() || '',
          duration: formValue.duration,
          consent: formValue.consent,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          doctor:formValue.doctorId,
          meetingUrl: formValue.meetingUrl?.trim() || '',
        };
  
        this.appointmentService.addAppoitement(appointmentData).subscribe({
          next: (response) => {
            console.log('Réponse du serveur:', response);
            this.submitSuccess = true;
            this.isSubmitting = false;
            creneau.disponible = false;
            this.filtrerCreneauxParDate(this.dateFilterControl.value);
            this.appointmentForm.reset();
            this.currentStep = 1;
            this.showConfirmation = false;
            setTimeout(() => this.submitSuccess = false, 5000);
            // Remove alert, success message is already shown
          },
          error: (error) => {
            console.error('Erreur soumission:', error);
            let errorMessage = 'Une erreur inattendue est survenue. Veuillez réessayer.';
            if (error.error) {
              if (typeof error.error === 'string') errorMessage = error.error;
              else if (error.error.message) errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
            this.submitError = errorMessage;
            this.isSubmitting = false;
          }
        });
      },
  
      //  Si la vérification échoue (403 ou autre) → on soumet quand même
      error: (error) => {
        console.warn('Vérification disponibilité impossible, soumission directe:', error.status);
  
        // Si 403 → le backend ne supporte pas encore cet endpoint, soumettre directement
        if (error.status === 403 || error.status === 404) {
          this.soumettreSansVerification(formValue, creneau);
        } else {
          this.submitError = 'Erreur de vérification. Veuillez réessayer.';
          this.isSubmitting = false;
        }
      }
    });
  }

  cancelConfirmation(): void {
    this.showConfirmation = false;
    this.currentStep = 2;
  }

  getSelectedDoctorName(): string {
    const doctorId = this.appointmentForm.get('doctorId')?.value;
    const doctor = this.doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : 'Médecin non trouvé';
  }

  getSelectedCreneau(): Creneau | undefined {
    const creneauId = this.appointmentForm.get('creneauId')?.value;
    return this.creneauxDisponibles.find(c => c.id === creneauId);
  }
  
  private soumettreSansVerification(formValue: any, creneau: Creneau): void {
      const appointmentType: 'video' | 'presential' = 
    formValue.appointmentType === 'video' ? 'video' : 'presential';
    const appointmentData: Appoitement = {
      id: 0,
      firstname: formValue.firstname?.trim(),
      patientId:0,
      lastname: formValue.lastname?.trim(),
      birthdate: formValue.birthdate,
      gender: formValue.gender || 'other',
      email: formValue.email?.trim(),
      phone: formValue.phone?.trim(),
      insurance: formValue.insurance?.trim() || '',
      speciality: Speciality.GENERAL,
      doctorType: formValue.doctorType,
      otherSpecialist: formValue.otherSpecialist?.trim() || '',
      doctorId: formValue.doctorId,
      creneauId: formValue.creneauId,
      creneau:formValue.creneauId ? this.creneauxDisponibles.find((c: Creneau) => c.id === formValue.creneauId) : undefined,
      appointmentType: appointmentType,
      preferredDate: creneau.date,
      preferredTime: creneau.heureDebut,
      altAvailability: formValue.altAvailability,
      reason: formValue.reason?.trim(),
      symptoms: formValue.symptoms?.trim() || '',
      firstVisit: formValue.firstVisit || 'no',
      allergies: formValue.allergies?.trim() || '',
      medications: formValue.medications?.trim() || '',
      zoomMeetingId: '',
      additionalInfo: formValue.additionalInfo?.trim() || '',
      duration: formValue.duration,
      consent: formValue.consent,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      doctor:formValue.doctorId,
      meetingUrl: '',
    };
  
    this.appointmentService.addAppoitement(appointmentData).subscribe({
      next: (response) => {
        this.submitSuccess = true;
        this.isSubmitting = false;
        creneau.disponible = false;
        this.filtrerCreneauxParDate(this.dateFilterControl.value);
        this.appointmentForm.reset();
        this.currentStep = 1;
        this.showConfirmation = false;
        setTimeout(() => this.submitSuccess = false, 5000);
        
      },
      error: (error) => {
        let errorMessage = 'Erreur lors de la soumission.';
        if (error.error?.message) errorMessage = error.error.message;
        this.submitError = errorMessage;
        this.isSubmitting = false;
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  
  showOtherSpecialist() {
    return this.appointmentForm.get('doctorType')?.value === 'other';
  }

    chargerCreneauxDuMedecin(doctorId: number): void {
    console.log('🔄 Chargement des créneaux pour le médecin ID:', doctorId);
    
    this.isLoadingCreneaux = true;
    this.creneauxDisponibles = [];
    this.creneauxFiltres = [];
    this.creneauLoadError = '';
    
    this.creneauService.getCreneauxDocteur(doctorId).subscribe({
      next: (creneaux: Creneau[]) => {
        console.log(' Créneaux reçus du serveur:', creneaux);
        
        
        this.creneauxDisponibles = creneaux.filter(c => {
          const isAvailable = Boolean(c.disponible);
          console.log(`Créneau ID ${c.id}: disponible=${c.disponible}, date=${c.date}, heure=${c.heureDebut}`);
          return isAvailable;
        });
        
        console.log('Créneaux disponibles après filtrage:', this.creneauxDisponibles.length);
        
        
        if (this.creneauxDisponibles.length === 0) {
          this.creneauLoadError = '⚠️ Aucun créneau disponible pour ce médecin. Veuillez en sélectionner un autre ou contacter le cabinet.';
          console.warn('⚠️ Aucun créneau disponible pour ce médecin');
        }
        
        this.filtrerCreneauxParDate(this.dateFilterControl.value);
        this.isLoadingCreneaux = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des créneaux:', error);
        this.isLoadingCreneaux = false;
        this.creneauLoadError = 'Impossible de charger les créneaux pour ce médecin. Veuillez réessayer.';
      }
    });
  }

  filtrerCreneauxParDate(date: string | null): void {
    if (!date) {
      this.creneauxFiltres = [...this.creneauxDisponibles];
    } else {
      this.creneauxFiltres = this.creneauxDisponibles.filter(c => c.date === date);
    }
    
    const selectedCreneauId = this.appointmentForm.get('creneauId')?.value;
    if (selectedCreneauId && !this.creneauxFiltres.some(c => c.id === selectedCreneauId)) {
      this.appointmentForm.patchValue({ creneauId: null });
    }
  }

  getCreneauxGroupesParDate(): { date: string; creneaux: Creneau[] }[] {
    const groupes = new Map<string, Creneau[]>();
    this.creneauxFiltres.forEach(creneau => {
      if (!groupes.has(creneau.date)) {
        groupes.set(creneau.date, []);
      }
      groupes.get(creneau.date)?.push(creneau);
    });
    return Array.from(groupes.entries())
      .map(([date, creneaux]) => ({
        date,
        creneaux: creneaux.sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  formatHeure(heureStr: string): string {
    return heureStr.substring(0, 5);
  }
  isCreneauSelected(creneauId: number | undefined): boolean {


    
    return this.appointmentForm.get('creneauId')?.value === creneauId;

  }
  selectCreneau(creneau: Creneau): void {
    this.appointmentForm.patchValue({
      creneauId: creneau.id,
      preferredDate: creneau.date,
      preferredTime: creneau.heureDebut
    });
   
    
    console.log(` Créneau ID ${creneau.id} sélectionné`);
  }

  getPeriodeJournee(heure: string): string {
    const heureNum = parseInt(heure.split(':')[0]);
    if (heureNum < 12) return 'morning';
    if (heureNum < 17) return 'afternoon';
    return 'evening';
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  isCreneauPasse(creneau: Creneau): boolean {
    if (!creneau.date || !creneau.heureDebut) {
      return false;
    }

    // Analyser la date (format YYYY-MM-DD ou DD/MM/YYYY)
    let dateStr = creneau.date.trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('/');
      dateStr = `${year}-${month}-${day}`;
    }

    const creneauDateTime = new Date(`${dateStr}T${creneau.heureDebut}`);
    const maintenant = new Date();

    return creneauDateTime < maintenant;
  }

  loadAllDoctors(): void {
    this.docteurService.getAllDocteurs().subscribe({
      next: (data: Docteur[]) => {
        console.log(' Données reçues:', data);
        this.doctors = data;
        console.log('📊 Nombre de docteurs chargés:', this.doctors.length);
      },
      error: (error: any) => {
        console.error('❌ Erreur complète:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Message:', error.message);
        console.error('❌ Error object:', error.error);
        
        // Gestion des erreurs spécifiques
        if (error.status === 0) {
          console.error('🔌 Erreur de connexion - Le backend est-il démarré ?');
        } else if (error.status === 401) {
          console.error('🔒 Non authentifié - Token invalide ou expiré');
        } else if (error.status === 403) {
          console.error('🚫 Accès refusé');
        } else if (error.status === 404) {
          console.error('🔍 Endpoint non trouvé');
        } else if (error.status === 405) {
          console.error('⚠️ Méthode HTTP non autorisée');
        }
      },
      complete: () => {
        console.log('✔️ Chargement terminé');
      }
    });
  }
  
}
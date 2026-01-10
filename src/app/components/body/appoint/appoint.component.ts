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
    private docteurService: DocteurService
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
        preferredTime: this.getPeriodeJournee(creneau.heureDebut)
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

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = '';

    const formValue = this.appointmentForm.value;
    console.log(' Step 1: formValue récupéré');

    // Validation des champs critiques
    if (!formValue.doctorId || !formValue.creneauId) {
      this.submitError = 'Veuillez sélectionner un médecin et un créneau';
      this.isSubmitting = false;
      return;
    }
    console.log(' Step 2: doctorId et creneauId validés');

    // Récupérer le docteur et le créneau sélectionnés
    // const docteur = this.doctors.find(d => d.id === formValue.doctorId);
    const creneau = this.creneauxDisponibles.find(c => c.id === formValue.creneauId);

    if (!creneau) {
      this.submitError = 'Médecin ou créneau introuvable';
      this.isSubmitting = false;
      return;
    }
    console.log(' Step 3: docteur et créneau trouvés');

    const appointmentData: Appoitement = {
      id: 0,
      firstname: formValue.firstname?.trim(),
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
      appointmentType: formValue.appointmentType,
      preferredDate: formValue.preferredDate,
      altAvailability: formValue.altAvailability,
      reason: formValue.reason?.trim(),
      symptoms: formValue.symptoms?.trim() || '',
      firstVisit: formValue.firstVisit || 'no',
      allergies: formValue.allergies?.trim() || '',
      medications: formValue.medications?.trim() || '',

      additionalInfo: formValue.additionalInfo?.trim() || '',
      consent: formValue.consent,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),  
      doctor: 0,
      preferredTime: ''
    };
    console.log(' Step 4: appointmentData construit');
    console.log('📋 JSON COMPLET:', JSON.stringify(appointmentData, null, 2));
    console.log('📤 Données envoyées au backend:', appointmentData);
    console.log('👨‍⚕️ Doctor ID sélectionné:', formValue.doctorId);
    console.log(' Step 5: logs affichés, appel service en cours...');
  
    this.appointmentService.addAppoitement(appointmentData).subscribe({
      next: (response) => {
        console.log(' Réponse du serveur:', response);
        this.submitSuccess = true;
        this.isSubmitting = false;
        
        // Marquer le créneau comme indisponible APRÈS la réussite
        creneau.disponible = false;
        this.filtrerCreneauxParDate(this.dateFilterControl.value);
        
        this.appointmentForm.reset();
        this.currentStep = 1;
        setTimeout(() => this.submitSuccess = false, 5000);
        alert('Rendez-vous ajouté avec succès !');
      },
      error: (error) => {
        console.error('Erreur lors de la soumission du formulaire:', error);
        console.error(' Détails de l\'erreur:', error.error);
        
        // Gestion robuste de l'erreur
        let errorMessage = 'Une erreur inattendue est survenue lors de la soumission. Veuillez réessayer plus tard.';
        
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Logs détaillés pour le debug
        console.error('Status:', error.status);
        console.error('Message d\'erreur final:', errorMessage);
        
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

  //  Charger les créneaux disponibles d'un médecin spécifique
  chargerCreneauxDuMedecin(doctorId: number): void {
    console.log('🔄 Chargement des créneaux pour le médecin ID:', doctorId);
    
    this.isLoadingCreneaux = true;
    this.creneauxDisponibles = [];
    this.creneauxFiltres = [];
    this.creneauLoadError = '';
    
    this.creneauService.getCreneauxDocteur(doctorId).subscribe({
      next: (creneaux: Creneau[]) => {
        console.log(' Créneaux reçus du serveur:', creneaux);
        
        // Filtrer les créneaux disponibles
        // Le filtre de date strict a été supprimé car les dates n'étaient pas compatibles
        this.creneauxDisponibles = creneaux.filter(c => {
          const isAvailable = Boolean(c.disponible);
          console.log(`Créneau ID ${c.id}: disponible=${c.disponible}, date=${c.date}, heure=${c.heureDebut}`);
          return isAvailable;
        });
        
        console.log('📅 Créneaux disponibles après filtrage:', this.creneauxDisponibles.length);
        
        // Vérifier s'il y a des créneaux disponibles
        if (this.creneauxDisponibles.length === 0) {
          this.creneauLoadError = '⚠️ Aucun créneau disponible pour ce médecin. Veuillez en sélectionner un autre ou contacter le cabinet.';
          console.warn('⚠️ Aucun créneau disponible pour ce médecin');
        }
        
        this.filtrerCreneauxParDate(this.dateFilterControl.value);
        this.isLoadingCreneaux = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des créneaux:', error);
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
      preferredTime: this.getPeriodeJournee(creneau.heureDebut)
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

  loadAllDoctors(): void {
    this.docteurService.getAllDocteurs().subscribe({
      next: (data: Docteur[]) => {
        console.log('✅ Données reçues:', data);
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
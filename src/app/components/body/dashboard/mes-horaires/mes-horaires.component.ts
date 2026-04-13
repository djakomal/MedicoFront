
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Creneau } from '../../../../models/Creneau'; 
import { CreneauService } from '../../../../_helps/Creneau/Creneau.service';

@Component({
  selector: 'app-mes-horaires',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './mes-horaires.component.html',
  styleUrls: ['./mes-horaires.component.css']
})
export class MesHorairesComponent implements OnInit {
  
  horaires: Creneau[] = [];
  creneauForm!:FormGroup;
  nouveauCreneau: any = {
    date: Date,
    heureDebut: '',
    heureFin: ''
  };

  isEditing = false;
  editingId: number | null = null;
  
  jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  constructor(private Router: Router,
    private FormBuilder: FormBuilder,
    private creneauService: CreneauService) {}
  
  ngOnInit(): void {
    this.creneauForm = this.FormBuilder.group({
      date: ['',[Validators.required]],
      heureDebut: ['',[Validators.required]],
      heureFin: ['',[Validators.required]]
    });
    this.chargerHoraires();
  }


  chargerHoraires(): void {
    this.creneauService.getMesCreneaux().subscribe({
      next: (data: Creneau[]) => {
        this.horaires = data;
        console.log('Créneaux chargés:', data);
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des créneaux:', error);
        alert('Erreur lors du chargement des créneaux');
      }
    });
  }
  
  ajouterCreneau(): void {
    // Récupérer les valeurs du formulaire
    const formValues = this.creneauForm.value;
    
    if (!this.validerCreneau(formValues)) {
      return;
    }
    
    // Calculer le jour de la semaine
    const date = new Date(formValues.date);
    const jour = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    
    // Créer l'objet créneau conforme au modèle
    const creneauData: Creneau = {
      date: formValues.date,
      heureDebut: formValues.heureDebut + ':00',
      heureFin: formValues.heureFin + ':00',
      disponible: true,
    };
    
    this.creneauService.ajouterCreneau(creneauData).subscribe({
      next: (response: Creneau) => {
        console.log('Créneau ajouté:', response);
        this.horaires.push(response);
        this.resetFormulaire();
        alert('Créneau ajouté avec succès !');
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'ajout du créneau:', error);
        alert('Erreur lors de l\'ajout du créneau: ' + (error.error?.message || error.message));
      }
    });
  }
  

  submitForm(): void {
    console.log('Formulaire valide?', this.creneauForm.valid);
    console.log('Valeurs:', this.creneauForm.value);
    console.log('Statut:', this.creneauForm.status);
  // Marquer tous les champs comme touchés pour afficher les erreurs
    Object.keys(this.creneauForm.controls).forEach(key => {
      this.creneauForm.get(key)?.markAsTouched();
    });
  
    // Vérifier si le formulaire est valide
    if (this.creneauForm.invalid) {
      console.log('Formulaire invalide:', this.creneauForm.errors);
      console.log('Valeurs:', this.creneauForm.value);
      
      // Afficher les erreurs par champ
      Object.keys(this.creneauForm.controls).forEach(key => {
        const control = this.creneauForm.get(key);
        if (control?.invalid) {
          console.log(`${key} est invalide:`, control.errors);
        }
      });
      
      alert('Veuillez remplir tous les champs');
      return;
    }
  
    if (this.isEditing) {
      this.sauvegarderModification();
  }
  else {
      this.ajouterCreneau();
    }   
  }

  modifierCreneau(creneau: Creneau): void {
    this.isEditing = true;
    this.editingId = creneau.id || null;
    this.creneauForm.patchValue({
      date: creneau.date,
      heureDebut: creneau.heureDebut.substring(0, 5),
      heureFin: creneau.heureFin.substring(0, 5)
    });
  }
  
  sauvegarderModification(): void {
    const formValues = this.creneauForm.value;
    
    if (!this.validerCreneau(formValues) || this.editingId === null) {
      return;
    }
  
    const date = new Date(formValues.date);
    const jour = date.toLocaleDateString('fr-FR', { weekday: 'long' });
  
    const creneauData: Creneau = {
      date: formValues.date,
      heureDebut: formValues.heureDebut + ':00',
      heureFin: formValues.heureFin + ':00',
      disponible: true,
    };
    
    this.creneauService.modifierCreneau(this.editingId, creneauData).subscribe({
      next: (response: Creneau) => {
        const index = this.horaires.findIndex(h => h.id === this.editingId);
        if (index !== -1) {
          this.horaires[index] = response;
        }
        this.resetFormulaire();
        alert('Créneau modifié avec succès !');
      },
      error: (error: any) => {
        console.error('Erreur lors de la modification:', error);
        alert('Erreur lors de la modification du créneau');
      }
    });
  }
  
  supprimerCreneau(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) {
      this.creneauService.supprimerCreneau(id).subscribe({
        next: () => {
          this.horaires = this.horaires.filter(h => h.id !== id);
          alert('Créneau supprimé avec succès !');
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression du créneau');
        }
      });
    }
  }
  
  annulerModification(): void {
    this.resetFormulaire();
  }
  
  resetFormulaire(): void {
    this.creneauForm.reset(); // Reset le FormGroup
    this.isEditing = false;
    this.editingId = null;
  }
  
  validerCreneau(creneau: any): boolean {
    if (!creneau.date || !creneau.heureDebut || !creneau.heureFin) {
      alert('Veuillez remplir tous les champs');
      return false;
    }
  
    if (creneau.heureDebut >= creneau.heureFin) {
      alert('L\'heure de début doit être avant l\'heure de fin');
      return false;
    }
    
    const dateSelectionnee = new Date(creneau.date);
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    
    if (dateSelectionnee < aujourdhui) {
      alert('La date doit être aujourd\'hui ou dans le futur');
      return false;
    }
    
    const chevauchement = this.horaires.some(h => {
      if (h.id === this.editingId) return false;
      if (h.date !== creneau.date) return false;
      
      const hDebut = h.heureDebut.substring(0, 5);
      const hFin = h.heureFin.substring(0, 5);
      
      return !(creneau.heureFin <= hDebut || creneau.heureDebut >= hFin);
    });
    
    if (chevauchement) {
      alert('Ce créneau chevauche un créneau existant pour ce jour');
      return false;
    }
    
    return true;
  }
  formatDate(dateStr: string ): string  {
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
  
  getJourSemaine(dateStr: string ): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  }
  
  getCreneauxParDate(): { [key: string]: Creneau[] } {
    const groupes: { [key: string]: Creneau[] } = {};
    
    this.horaires.forEach(creneau => {
      const dateKey = creneau.date;
      
      if (!groupes[dateKey]) {
        groupes[dateKey] = [];
      }
      groupes[dateKey].push(creneau);
    });
    
    Object.keys(groupes).forEach(date => {
      groupes[date].sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
    });
    
    return groupes;
  }
  
  getDates(): string[] {
    return Object.keys(this.getCreneauxParDate()).sort();
  }
  
  getHorairesParDate(date: string): Creneau[] {
    return this.getCreneauxParDate()[date] || [];
  }
  
  getHorairesParJour(jour: string): Creneau[] {
    return this.horaires.filter(h => {
      const date = new Date(h.date);
      const jourCreneau = date.toLocaleDateString('fr-FR', { weekday: 'long' });
      return jourCreneau.toLowerCase() === jour.toLowerCase();
    }).sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.heureDebut.localeCompare(b.heureDebut);
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointementService } from '../../../../_helps/appointment/appointement.service';
import { JwtService } from '../../../../_helps/jwt/jwt.service';
import { Appoitement } from '../../../../models/appoitement';

interface Patient {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateNaissance: string;
  genre: string;
  allergie: string;
  medicaments: string;
  nombreRdv: number;
  dernierRdv: string;
  statut: string;
  rendezVous: Appoitement[]; // ← tous les RDV du patient
}

@Component({
  selector: 'app-mes-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mes-patients.component.html',
  styleUrls: ['./mes-patients.component.css']
})
export class MesPatientsComponent implements OnInit {

  patients: Patient[] = [];
  patientsFiltres: Patient[] = [];
  isLoading = true;
  recherche = '';
  erreur = '';

  // Modal
  modalOuvert = false;
  patientSelectionne: Patient | null = null;
  rdvSelectionne: Appoitement | null = null;

  constructor(
    private appointementService: AppointementService,
    private jwtService: JwtService
  ) {}

  ngOnInit(): void {
    this.chargerPatients();
  }

  chargerPatients(): void {
    this.isLoading = true;
    this.erreur = '';

    this.appointementService.getAllAppointment().subscribe({
      next: (rdvs: Appoitement[]) => {
        this.patients = this.extrairePatients(rdvs);
        this.patientsFiltres = [...this.patients];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement patients:', err);
        this.erreur = 'Impossible de charger les patients.';
        this.isLoading = false;
      }
    });
  }

  private extrairePatients(rdvs: Appoitement[]): Patient[] {
    const map = new Map<string, Patient>();

    rdvs.forEach(rdv => {
      const cle = rdv.email || `${rdv.firstname}-${rdv.lastname}`;

      if (map.has(cle)) {
        const existing = map.get(cle)!;
        existing.nombreRdv++;
        existing.rendezVous.push(rdv);
        if (rdv.preferredDate > existing.dernierRdv) {
          existing.dernierRdv = rdv.preferredDate;
          existing.statut = rdv.status;
        }
      } else {
        map.set(cle, {
          id: rdv.id,
          nom: rdv.lastname || '',
          prenom: rdv.firstname || '',
          email: rdv.email || '',
          telephone: rdv.phone || '',
          dateNaissance: rdv.birthdate || '',
          genre: rdv.gender || '',
          allergie: rdv.allergies || 'Aucune',
          medicaments: rdv.medications || 'Aucun',
          nombreRdv: 1,
          dernierRdv: rdv.preferredDate || '',
          statut: rdv.status || 'pending',
          rendezVous: [rdv]
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.nom.localeCompare(b.nom));
  }

  // ── Modal ─────────────────────────────────────────
  ouvrirModal(patient: Patient): void {
    this.patientSelectionne = patient;
    this.rdvSelectionne = patient.rendezVous[0] ?? null;
    this.modalOuvert = true;
    document.body.style.overflow = 'hidden';
  }

  fermerModal(): void {
    this.modalOuvert = false;
    this.patientSelectionne = null;
    this.rdvSelectionne = null;
    document.body.style.overflow = '';
  }

  selectionnerRdv(rdv: Appoitement): void {
    this.rdvSelectionne = rdv;
  }

  fermerSiCliqueExterieur(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.fermerModal();
    }
  }

  // ── Utilitaires ───────────────────────────────────
  filtrer(): void {
    const terme = this.recherche.toLowerCase().trim();
    if (!terme) { this.patientsFiltres = [...this.patients]; return; }
    this.patientsFiltres = this.patients.filter(p =>
      p.nom.toLowerCase().includes(terme) ||
      p.prenom.toLowerCase().includes(terme) ||
      p.email.toLowerCase().includes(terme) ||
      p.telephone.includes(terme)
    );
  }

  getInitiales(prenom: string, nom: string): string {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
  }

  getGenreLabel(genre: string): string {
    const labels: any = { male: 'Homme', female: 'Femme', other: 'Autre' };
    return labels[genre] || genre;
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      pending: 'En attente', validated: 'Validé',
      rejected: 'Rejeté',   started: 'En cours'
    };
    return labels[statut] || statut;
  }

  getStatutClass(statut: string): string {
    const classes: any = {
      pending: 'statut-pending', validated: 'statut-validated',
      rejected: 'statut-rejected', started: 'statut-started'
    };
    return classes[statut] || '';
  }
}
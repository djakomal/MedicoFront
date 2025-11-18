import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mes-rendez-vous',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mes-rendez-vous.component.html',
  styleUrls: ['./mes-rendez-vous.component.css']
})
export class MesRendezVousComponent {
  rendezVous = [
    { id: 1, date: '2024-11-15', heure: '09:00', patient: 'Jean Dupont', motif: 'Consultation générale' },
    { id: 2, date: '2024-11-15', heure: '10:30', patient: 'Marie Martin', motif: 'Suivi' },
    { id: 3, date: '2024-11-16', heure: '14:00', patient: 'Pierre Bernard', motif: 'Examen' }
  ];
}

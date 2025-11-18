import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-types-consultations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './types-consultations.component.html',
  styleUrls: ['./types-consultations.component.css']
})
export class TypesConsultationsComponent {
  consultations = [
    { id: 1, nom: 'Consultation générale', prix: '5000 FCFA', duree: '30 min' },
    { id: 2, nom: 'Consultation spécialisée', prix: '10000 FCFA', duree: '45 min' },
    { id: 3, nom: 'Suivi médical', prix: '3000 FCFA', duree: '15 min' }
  ];
}

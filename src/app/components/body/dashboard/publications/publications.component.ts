import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-publications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.css']
})
export class PublicationsComponent {
  publications = [
    { id: 1, titre: 'Avancées en Cardiologie', journal: 'Journal Médical International', annee: '2022' },
    { id: 2, titre: 'Nouvelles Techniques d\'Imagerie', journal: 'Revue Africaine de Santé', annee: '2021' },
    { id: 3, titre: 'Prévention des Maladies Cardiovasculaires', journal: 'Publication Locale', annee: '2020' }
  ];
}

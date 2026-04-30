import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-associations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './associations.component.html',
  styleUrls: ['./associations.component.css']
})
export class AssociationsComponent {
  associations = [
    { id: 1, nom: 'Ordre des Médecins du Bénin', role: 'Membre' },
    { id: 2, nom: 'Société de Cardiologie Africaine', role: 'Membre Actif' },
    { id: 3, nom: 'Association pour la Santé Publique', role: 'Vice-Président' }
  ];
}

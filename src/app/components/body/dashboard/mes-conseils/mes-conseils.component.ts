import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mes-conseils',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mes-conseils.component.html',
  styleUrls: ['./mes-conseils.component.css']
})
export class MesConseilsComponent {
  conseils = [
    { id: 1, titre: 'Hydratation', description: 'Buvez au moins 8 verres d\'eau par jour' },
    { id: 2, titre: 'Exercise', description: 'Faites 30 minutes d\'exercice quotidien' },
    { id: 3, titre: 'Sommeil', description: 'Dormez 7-8 heures par nuit' }
  ];
}

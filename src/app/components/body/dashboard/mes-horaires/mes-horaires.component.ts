import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mes-horaires',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mes-horaires.component.html',
  styleUrls: ['./mes-horaires.component.css']
})
export class MesHorairesComponent {
  horaires = [
    { jour: 'Lundi', debut: '08:00', fin: '17:00' },
    { jour: 'Mardi', debut: '08:00', fin: '17:00' },
    { jour: 'Mercredi', debut: '08:00', fin: '17:00' },
    { jour: 'Jeudi', debut: '08:00', fin: '17:00' },
    { jour: 'Vendredi', debut: '08:00', fin: '16:00' },
    { jour: 'Samedi', debut: 'Fermé', fin: 'Fermé' }
  ];
}

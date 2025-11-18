import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-langues-parlees',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './langues-parlees.component.html',
  styleUrls: ['./langues-parlees.component.css']
})
export class LanguesParleesComponent {
  langues = [
    { id: 1, nom: 'Français', niveau: 'Courant' },
    { id: 2, nom: 'Anglais', niveau: 'Intermédiaire' },
    { id: 3, nom: 'Fon', niveau: 'Courant' }
  ];
}

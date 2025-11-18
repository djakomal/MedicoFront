import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mes-formations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mes-formations.component.html',
  styleUrls: ['./mes-formations.component.css']
})
export class MesFormationsComponent {
  formations = [
    { id: 1, titre: 'Doctorat en Médecine', universite: 'Université Nationale du Bénin', annee: '2010' },
    { id: 2, titre: 'Master en Cardiologie', universite: 'Université de Dakar', annee: '2014' },
    { id: 3, titre: 'Spécialisation en Imagerie Médicale', universite: 'Institut Français de Santé', annee: '2018' }
  ];
}

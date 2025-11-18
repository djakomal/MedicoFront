import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mes-experiences',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mes-experiences.component.html',
  styleUrls: ['./mes-experiences.component.css']
})
export class MesExperiencesComponent {
  experiences = [
    { id: 1, titre: 'Médecin Cardiologue', entreprise: 'Hôpital Central', annees: '2015-2023' },
    { id: 2, titre: 'Médecin Généraliste', entreprise: 'Clinique Saint-Jean', annees: '2010-2015' },
    { id: 3, titre: 'Interne', entreprise: 'CHU de Cotonou', annees: '2008-2010' }
  ];
}

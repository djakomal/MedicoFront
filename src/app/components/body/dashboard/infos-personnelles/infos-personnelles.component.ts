import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-infos-personnelles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './infos-personnelles.component.html',
  styleUrls: ['./infos-personnelles.component.css']
})
export class InfosPersonnellesComponent {
  medecin = {
    nom: 'Dr. ABALO Komi',
    specialite: 'Cardiologue',
    email: 'abalo@medico.com',
    telephone: '+229 90123456',
    adresse: 'Cotonou, Bénin'
  };
}

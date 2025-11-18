import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mes-patients',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mes-patients.component.html',
  styleUrls: ['./mes-patients.component.css']
})
export class MesPatientsComponent {
  patients = [
    { id: 1, nom: 'Jean Dupont', age: 45, telephone: '+229 90123456' },
    { id: 2, nom: 'Marie Martin', age: 38, telephone: '+229 90234567' },
    { id: 3, nom: 'Pierre Bernard', age: 52, telephone: '+229 90345678' }
  ];
}

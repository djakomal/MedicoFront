import { Component } from '@angular/core';
import { SidbarComponent } from './sidbar/sidbar.component';
import { MainComponent } from './main/main.component';
import { BodyComponent } from '../body/body.component';
import { HeaderComponent } from '../header/header.component';
import { RegisteDetComponent } from './main/registe-det/registe-det.component';
import { AppointmentComponent } from './main/appointment/appointment.component';
import { RouterOutlet } from '@angular/router';
import { FormulaireComponent } from './formulaire/formulaire.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [SidbarComponent,MainComponent,BodyComponent,HeaderComponent,MainComponent,
    RegisteDetComponent,AppointmentComponent,RouterOutlet,FormulaireComponent
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {

}

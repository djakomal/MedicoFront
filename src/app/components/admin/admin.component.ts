import { Component } from '@angular/core';
import { SidbarComponent } from './sidbar/sidbar.component';
import { MainComponent } from './main/main.component';
import { BodyComponent } from '../body/body.component';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormulaireComponent } from './formulaire/formulaire.component';
import { AppointmentComponent } from './main/appointment/appointment.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [SidbarComponent, MainComponent, MainComponent,
    RouterOutlet],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {

}

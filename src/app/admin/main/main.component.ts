import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { BodyComponent } from './body/body.component';
import { RouterOutlet } from '@angular/router';
import { SidbarComponent } from "../sidbar/sidbar.component";

import { AppointmentComponent } from './appointment/appointment.component';
import { RegisteDetComponent } from './registe-det/registe-det.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [HeaderComponent, BodyComponent, RouterOutlet, SidbarComponent,AppointmentComponent,RegisteDetComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {

}

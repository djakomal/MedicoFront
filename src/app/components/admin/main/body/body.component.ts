import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppointmentComponent } from '../appointment/appointment.component';
import { RegisteDetComponent } from '../registe-det/registe-det.component';


@Component({
  selector: 'app-body',
  standalone: true,
  imports: [RouterOutlet,AppointmentComponent],
  templateUrl: './body.component.html',
  styleUrl: './body.component.css'
})
export class BodyComponent {

}

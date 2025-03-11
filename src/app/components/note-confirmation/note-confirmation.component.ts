import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


import { CommonModule } from '@angular/common';


import { AppointementService } from '../../_helps/appointement.service';
import { AppointmentComponent } from '../admin/main/appointment/appointment.component';
import { Appoitement } from '../../models/appoitement';

@Component({
  selector: 'app-note-confirmation',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './note-confirmation.component.html',
  styleUrl: './note-confirmation.component.css'
})
export class NoteConfirmationComponent implements OnInit{

  tableauClasse!:Appoitement[]
 

  constructor( private router :Router
    ,
    private appointementService:AppointementService,
    // private register :RegisterService
 
  ){

  }
 ngOnInit(): void {
     this.getAppointment()
 }
 getAppointment() {
  this.appointementService.getAllAppointment().subscribe(
    (data) => {
      this.tableauClasse = data;
      console.log(data)
    },
    (error) => {
      console.log(error);
    }
  )
}
redirection(){
  this.router.navigateByUrl("Admin/form")
}
// viewUserDetails(id: number) {
//   this.register.getUserById(id).subscribe(user => {
//     this.selectedUser = user;
//   });
// }
}

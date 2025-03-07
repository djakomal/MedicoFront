import { Component, OnInit } from '@angular/core';
import { Appoitement } from '../models/appoitement';
import { Router } from '@angular/router';
import { AppointementService } from '../_helps/appointement.service';

import { CommonModule } from '@angular/common';
import { AppointmentComponent } from '../admin/main/appointment/appointment.component';

import { User } from '../models/user';

@Component({
  selector: 'app-note-confirmation',
  standalone: true,
  imports: [  CommonModule,AppointmentComponent ],
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

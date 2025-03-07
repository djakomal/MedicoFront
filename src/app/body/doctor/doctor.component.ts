import { Component } from '@angular/core';
import { AppointementService } from '../../_helps/appointement.service';
import { Appoitement } from '../../models/appoitement';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppointementInsertService } from '../../_helps/appointement-insert.service';
import { Router } from '@angular/router';
import { HeaderComponent } from "../../header/header.component";

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule, HeaderComponent],
  templateUrl: './doctor.component.html',
  styleUrl: './doctor.component.css'
})
export class DoctorComponent {

 
  mat!: Appoitement;
  status:String='';
  form!: FormGroup
  constructor(
    
    private formservice: AppointementInsertService,
    private service : AppointementService,
    private router :Router
  
  ) { }

  ngOnInit(): void {
    this.form = this.formservice.appointementInsertCreate();
  }
  Submit() {
    this.mat = this.form.value;
  
    this.service.addAppoitement(this.mat).subscribe(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.log(error);
      }
    )
    this.status='en attente de confirmation';
    console.log(this.form.value);
    this.form.reset();
  }
}

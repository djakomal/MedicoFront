import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointTypeServiceService } from '../../../_helps/appoint-type-service.service';

@Component({
  selector: 'app-appoint',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './appoint.component.html',
  styleUrl: './appoint.component.css'
})
export class AppointComponent {
  appointmentForm: FormGroup=new FormGroup({}) ;
  constructor(private fb : FormBuilder,
    private router: Router,
    private appointTypeServiceService: AppointTypeServiceService,
  ) { 
    }
    ngOnInit(): void {
      this.appointmentForm = this.fb.group({
        patientName: ['', [Validators.required]],
        date: ['', [Validators.required]],
        type: ['', [Validators.required]],
        description: ['', [Validators.required]]
      });
    }
    
    onSubmit(): void {
      const formData = this.appointmentForm.value;
      this.appointTypeServiceService.addAppoitementType(formData).subscribe(
        Response => {
          alert('Rendez-vous soumis avec succès');
          this.router.navigateByUrl('dash');
        },
        error => {
          if (error.status === 400) {
            alert(error.error.message); // Affiche le message d'erreur du backend
          } 
        }
        

      )
   
    }
    

}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointTypeServiceService } from '../../../_helps/appoint-type-service.service';
import { JwtService } from '../../../_helps/jwt.service';
import { HttpHeaders } from '@angular/common/http';

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
    private jwtService: JwtService,
  ) { 
    }
    ngOnInit(): void {
      this.appointmentForm = this.fb.group({
        name: ['', [Validators.required]],
        date: ['', [Validators.required]],
        heure: ['', [Validators.required]],
        type: ['', [Validators.required]],
        description: ['', [Validators.required]]
      });
      this.appointmentForm.get('type')?.setValue('GENERAL'); 

    }
    
    
    onSubmit(): void {
      const formData = this.appointmentForm.value;
      this.appointTypeServiceService.addAppoitementType(formData).subscribe({
        next: response =>{
          alert('Rendez-vous soumis avec succès');
          console.log("✅ Succès:", response),
          this.router.navigateByUrl('dash');
        } ,
        error: err => console.error("❌ Erreur:", err)
      });
      // if (formData) {
      //   console.log('Rendez-vous soumis avec succès', formData);
      //   this.router.navigateByUrl('dash');

      // } else {
      //   console.log('Formulaire invalide');
      
      // }
    }
    onTypeChange(event: any) {
      console.log("📌 Type sélectionné :", event.target.value);
    }
    

}

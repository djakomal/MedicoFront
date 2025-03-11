// import { Component, NgModule } from '@angular/core';
// import { User } from '../../models/user';
// import {  FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { RegisterService } from '../../_helps/register.service';
// import { ActivatedRoute, Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { first } from 'rxjs';
// import { RegisterInsertService } from '../../_helps/register-insert.service';
// import { JwtService } from '../../_helps/jwt.service';

// @Component({
//   selector: 'app-update',
//   standalone: true,
//   imports: [CommonModule,ReactiveFormsModule,FormsModule,FormsModule],
//   templateUrl: './update.component.html',
//   styleUrl: './update.component.css'
// })
// export class UpdateComponent {
// ;

 
 
//   user !: User ;
//   form!: FormGroup
//   user_id!:number;
//   constructor(
//     private service : JwtService
//     private router :Router,
//     private route :ActivatedRoute,
 
  
//   ) { }

//   ngOnInit(): void {

//     this.user_id = this.route.snapshot.params['user_id'];
//     this.service.getUserById(this.user_id).subscribe((data=>{
//       this.user = data;
//     })); 


//         // Création du formulaire à partir du service
//         this.form = this.insert.RegisterInsertCreate();

//         // Si vous souhaitez pré-remplir le formulaire avec les données du modèle récupéré
//         if (this.user) {
//           this.form.patchValue(this.user);
//         }
        

//   }
  
  
//   Submit() {
//     console.log(this.form.value);
//     this.service.Update(this.user_id, this.form.value).subscribe((res:any) => {
//          console.log('Post updated successfully!');
//          this.router.navigateByUrl('/Admin/regGet');
//   })
// }

// get f(){
//   return this.form.controls;
// }


// }
  
  



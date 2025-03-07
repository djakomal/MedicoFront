import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ConnexionComponent } from '../connexion/connexion.component';



const routes:Routes=[
  {path:'',redirectTo:'connex', pathMatch:'full'},
  
];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,RouterModule.forChild(routes),ConnexionComponent
  ],
  exports:[RouterModule]
})
export class AuthRoutingModule { }

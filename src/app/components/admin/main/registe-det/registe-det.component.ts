import { Component } from '@angular/core';


import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from '../../../../models/user';
import { RegisterServiceService } from '../../../../_helps/register-service.service';


@Component({
  selector: 'app-registe-det',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './registe-det.component.html',
  styleUrl: './registe-det.component.css'
})
export class RegisteDetComponent {
  tableauClasse!:User[]



  constructor( 
    private router :Router
    ,
    // private registerService:RegisterServiceService
  ){

  }
 ngOnInit(): void {
     this.getRegister()
 }
 getRegister() {
  // this.registerService.getAllRegister().subscribe(
  //   (data) => {
  //     this.tableauClasse = data;
  //     console.log(data)
  //   },
  //   (error) => {
  //     console.log(error);
  //   }
  // )
}
redirection(){
  this.router.navigateByUrl("form")
}
redirectionUpdate(id: number){
  this.router.navigateByUrl("regis/update");
}

deleteUser(id: number) {
  // this.registerService.deleteUser(id)
  //   .subscribe(() => {
  //     // Supprimer le cours du tableau
  //     this.tableauClasse = this.tableauClasse.filter(c => c.id !== id);
  //   });
}

update(sid:number){
  console.log(sid);
  this.router.navigate(['update',sid]);
}
// }



}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  constructor(private router :Router){

  }
 ngOnInit(): void {
     
 }
 logout(){
  this.router.navigateByUrl("connex");


 }
}

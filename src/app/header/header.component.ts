import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
// Ensure ConnexionComponent is standalone
import { Router, RouterOutlet } from '@angular/router';

import { NotificationService } from '../_helps/notification.service';
import { JwtService } from '../_helps/jwt.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, RouterOutlet, CommonModule], // Remove ConnexionComponent if it's not standalone
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  userName: string | null = null; // Stocke le nom de l'utilisateur

  notifications: string[] = [];

  menuOpen: boolean = false;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private jwtService: JwtService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.notificationService.getNotifications().subscribe((notifications) => {
      this.notifications = notifications;
    });

    this.loadUserName();
  }

  clearNotifications() {
    this.notificationService.clearNotifications();
  }
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.cdr.detectChanges(); // Force la mise à jour de l'affichage
    console.log("Menu toggled: ", this.menuOpen);
  }

  loadUserName(): void {
    this.userName = this.jwtService.getUserName();
    console.log("Nom de l'utilisateur : ", this.userName);
  }

  logout(): void {
    this.jwtService.removeToken();
    this.userName = null; // Supprime le nom affiché
    this.menuOpen = false; // Ferme le menu
    this.router.navigateByUrl('/connex'); // Redirection vers la page de connexion
  }

 

  //  switchOnAll() {

  //   if(this.altern!=false){
  //      this.status="LogOut"

  //   }

  //  }
}

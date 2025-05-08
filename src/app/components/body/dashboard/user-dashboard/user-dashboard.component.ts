import { ChangeDetectorRef, Component } from '@angular/core';
import { NotificationService } from '../../../../_helps/notification.service';
import { Router } from '@angular/router';
import { JwtService } from '../../../../_helps/jwt/jwt.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {
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

}

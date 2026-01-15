import { Publication } from './../../../../../models/Publication';
import { PublicationService } from './../../../../../_helps/publication.service';
import { Component } from '@angular/core';
import { Message } from '@stomp/stompjs';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../../_helps/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-get-actualite',
  standalone: true,
  imports: [ CommonModule,FormsModule ,ReactiveFormsModule],
  templateUrl: './get-actualite.component.html',
  styleUrl: './get-actualite.component.css'
})
export class GetActualiteComponent {
  publication: Publication[] = [];
  messageList!: Message[];
  
  // Messages de notification
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'success';
  
  constructor(
    private router: Router,
    private publicationService: PublicationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.getConseils();
  }

  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    
    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }
  
  hideNotification(): void {
    this.showAlert = false;
  }

  getConseils(): void {
    this.publicationService.getAllPublications().subscribe({
      next: (data) => {
        console.log("📌 Données reçues :", data);
        
        if (Array.isArray(data)) {
          this.publication = data;
        } else {
          console.error("❌ Format des données incorrect :", data);
        }
      },
      error: (error) => {
        console.error("❌ Erreur API :", error);
        this.showNotification("Erreur lors du chargement des conseils", 'error');
      }
    });
  }

  deleteconseils(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce conseil ?')) {
      this.publicationService.deletePublication(id).subscribe({
        next: () => {
          this.showNotification("Conseil supprimé avec succès", 'success');
          this.getConseils();
        },
        error: (error) => {
          console.error("❌ Erreur lors de la suppression :", error); 
          this.showNotification("Erreur lors de la suppression du conseil", 'error');
        }
      });
    }
  }

  updateconseils(id: number): void {
    this.router.navigate(['/dashboard/mes-conseils/modifier', id]);
  }

  viewConseil(id: number): void {
    this.router.navigate(['/dashboard/mes-conseils/voir', id]);
  }
}

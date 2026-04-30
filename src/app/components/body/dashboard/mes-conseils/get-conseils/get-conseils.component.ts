import { Component } from '@angular/core';
import { Conseil } from '../../../../../models/Conseil';
import { Message } from '../../../../../models/Message';
import { ConseilService } from '../../../../../_helps/Docteur/Conseil/Conseil.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../../_helps/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JwtService } from '../../../../../_helps/jwt/jwt.service';

@Component({
  selector: 'app-get-conseils',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './get-conseils.component.html',
  styleUrl: './get-conseils.component.css'
})
export class GetConseilsComponent {
    conseils:Conseil[]=[];
    messageList!:Message[];
    doctorId!: number;
    // Messages de notification
    showAlert: boolean = false;
    alertMessage: string = '';
    alertType: 'success' | 'error' | 'info' = 'success'; 
    constructor( private router :Router,
        private conseilService:ConseilService,
        private notificationService: NotificationService,
        private jwtService: JwtService 
      ){
    
      }
     ngOnInit(): void {
      this.getConseils();
      this.doctorId = this.jwtService.getDoctorId()!;
     }

     showNotification(message: string, type: 'success' | 'error' | 'info'): void {
      this.alertMessage = message;      // Texte à afficher
      this.alertType = type;            // Type de notification (couleur)
      this.showAlert = true;            // Afficher la notification
      // Masquer automatiquement après 5 secondes
      setTimeout(() => {
        this.hideNotification();
      }, 5000);
    }
    
    hideNotification(): void {
      this.showAlert = false;
    }
     getConseils() {
      // recuperer le doctorId depuis le jwtService

      this.doctorId = this.jwtService.getDoctorId()!;
      
      this.conseilService.getAllConseils().subscribe({
        next: (data) => {
          console.log("📌 Données reçues :", data);
          
          if (Array.isArray(data)) {
            this.conseils = data;
          } else {
            console.error("❌ Format des données incorrect :", data);
          }
        },
        error: (error) => {
          console.error("❌ Erreur API :", error);
        }
      });
    }
    deleteconseils(id:number ){
      this.conseilService.deleteConseil(id).subscribe({
        next: (data) => {
          this.showNotification("Conseil supprimé avec succès", 'success');
          this.getConseils(); // Rafraîchir la liste après suppression
        },
        error: (error) => {
          console.error("❌ Erreur lors de la suppression :", error); 
          this.showNotification("Erreur lors de la suppression du conseil", 'error');
        }
      });
    }
    updateconseils(id:number){
      this.conseilService.updateConseil(id,this.conseils[id]).subscribe({
        next: (data) => {
          this.showNotification("Conseil mis à jour avec succès", 'success');
          this.getConseils(); // Rafraîchir la liste après mise à jour
        },
        error: (error) => {
          console.error("❌ Erreur lors de la mise à jour :", error); 
          this.showNotification("Erreur lors de la mise à jour du conseil", 'error');
        }
      });
      this.router.navigate(['/DocDash/updateconseils', id]);
    }
}

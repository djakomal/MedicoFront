import { Component, OnInit } from '@angular/core';
import { JwtService } from '../../_helps/jwt.service';



@Component({
  selector: 'app-content',
  standalone: true,
  imports: [],
  templateUrl: './content.component.html',
  styleUrl: './content.component.css'
})
export class ContentComponent implements OnInit {
  data: any[] = []; 
  componentToShow: string = "welcome";

	constructor(private jwtService: JwtService) { }

  ngOnInit(): void {
    this.jwtService.get('/messages').subscribe(
      (response) => {
        this.data = response; // Stocke la réponse de l'API dans la variable data
      },
      (error) => {
        if (error.status === 401) {
          alert('Session expirée. Veuillez vous reconnecter.');
        } else {
          this.data = error.error.code;
          alert('Une erreur est survenue.');
        }
      }
    );
  }
}

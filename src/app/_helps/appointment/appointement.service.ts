import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { Appoitement } from '../../models/appoitement';
import { JwtService } from '../jwt/jwt.service';

// Ajouter l'interface ICI, avant le @Injectable
export interface AppointmentResponse {
  success: boolean;
  message: string;
  appointment: Appoitement;
}

@Injectable({
  providedIn: 'root'
})
export class AppointementService {

  private matiereUrl = "http://localhost:8080/medico/appointment";

  constructor(private http: HttpClient,
  private jwtService: JwtService) { }

    private getHeaders(): HttpHeaders {
      const token = localStorage.getItem('authToken') || 
                    localStorage.getItem('token') || 
                    localStorage.getItem('jwtToken');
      
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
    }

  // Ajouter un rendez-vous
  public addAppoitement(appoitement: Appoitement): Observable<Appoitement> {
    return this.http.post<Appoitement>(
      `${this.matiereUrl}/add`, 
      appoitement,{
        headers:this.getHeaders()
      }
    );
  }

  // Récupérer tous les rendez-vous
  public getAllAppointment(): Observable<Appoitement[]> {
    return this.http.get<Appoitement[]>(
      this.matiereUrl,{
        headers:this.getHeaders()
      }
    );
  }
  

  // Récupérer un rendez-vous par ID
  getAppById(id: number): Observable<Appoitement> {
    return this.http.get<Appoitement>(
      `${this.matiereUrl}/get/${id}`,{
        headers:this.getHeaders()
      }
    );
  }
  
  // Supprimer un rendez-vous
  deleteAppointment(id: number): Observable<any> {
    console.log('🗑️ Tentative de suppression du rendez-vous ID:', id);
    
    //  VALIDATION
    if (!id || id <= 0) {
      console.error(' ID invalide:', id);
      throw new Error('ID de rendez-vous invalide');
    }

    return this.http.delete<any>(
      `${this.matiereUrl}/delete/${id}`,
      { 
        observe: 'response' //  Pour capturer toute la réponse HTTP
      }
    ).pipe(
      tap((response: any) => {
        console.log(' Rendez-vous supprimé avec succès:', response);
      }),
      catchError(error => {
        console.error(' Erreur lors de la suppression:', error);
        if (error.status === 401) {
          console.error('🔒 Token expiré ou invalide');
        } else if (error.status === 404) {
          console.error(' Rendez-vous introuvable');
        }
        throw error;
      })
    );
  }
  // Récupérer les rendez-vous d'aujourd'hui
  public getTodayAppointments(): Observable<Appoitement[]> {
    return this.http.get<Appoitement[]>(
      `${this.matiereUrl}/today`
    );
  }

  // Récupérer les rendez-vous d'un médecin
  public getAppointmentsByDoctor(doctorId: number): Observable<Appoitement[]> {
    return this.http.get<Appoitement[]>(
      `${this.matiereUrl}/doctor/${doctorId}`,{
        headers:this.getHeaders()
      }
    );
  }

  // Récupérer les rendez-vous d'un patient
  public getAppointmentsByPatient(patientId: number): Observable<Appoitement[]> {
    return this.http.get<Appoitement[]>(
      `${this.matiereUrl}/patient/all/${patientId}`,
      {
        headers:this.getHeaders()
      }
    );
  }

  // Mettre à jour un rendez-vous
  public updateAppointment(id: number, appoitement: Appoitement): Observable<Appoitement> {
    return this.http.put<Appoitement>(
      `${this.matiereUrl}/update/${id}`,
      appoitement,{
        headers:this.getHeaders()
      }
    );
  }

  // Recuperer le rendez-vous en fonction du docteur 
  // public getAppointmentByDocteur(docteurId: number): Observable<Appoitement[]> {
  //   return this.http.get<Appoitement[]>(
  //     `${this.matiereUrl}/doctor/${docteurId}`,
  //     { headers: this.getHeaders() }
  //   );
  // }


  // NOUVELLES MÉTHODES DE VALIDATION
  
  // Valider un rendez-vous
  public validateAppointment(id: number): Observable<AppointmentResponse> {
    return this.http.put<AppointmentResponse>(
      `${this.matiereUrl}/${id}/validate`,
      {},{
        headers: this.getHeaders()
      }
    );
  }

  // Rejeter un rendez-vous
  public rejectAppointment(id: number): Observable<AppointmentResponse> {
    return this.http.put<AppointmentResponse>(
      `${this.matiereUrl}/${id}/reject`,
      {  },
      {headers: this.getHeaders()}
    );
  }

  // Débuter un rendez-vous
  public startAppointment(id: number): Observable<AppointmentResponse> {
    return this.http.put<AppointmentResponse>(
      `${this.matiereUrl}/${id}/start`,
      {},
      {headers: this.getHeaders()}
    );
  }
}
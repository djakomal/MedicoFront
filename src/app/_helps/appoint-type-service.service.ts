import { Injectable } from '@angular/core';
import { AppoitementType } from '../models/appoitementType';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { catchError, Observable, Subject, tap, throwError } from 'rxjs';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root'
})
export class AppointTypeServiceService {

   private matiereUrl = "http://localhost:8080/medico/type"
   private refreshNeeded$ = new Subject<void>(); 
   constructor(
     private http: HttpClient,
     private jwtService:JwtService
   ) { }
  public addAppoitementType(appoitement: AppoitementType ): Observable<AppoitementType> {
    const token = this.jwtService.getToken();

  
    if (!token) {
      console.error("Token is missing");
      throw new Error("Token is required");
    }
    if (!appoitement.type || appoitement.type.trim() === "") {
      console.warn("⚠️ Type vide, définition d'une valeur par défaut...");
      appoitement.type = "GENERAL"; // Remplace par une valeur valide de ton Enum
    }
    

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<AppoitementType>(this.matiereUrl, appoitement, { headers })
      .pipe(
        catchError(error => {
          console.log("donnee:", appoitement);
          console.error('Erreur lors de l\'ajout du type de rendez-vous:', error);
          throw error; // Lance l'erreur pour que le composant appelant puisse la gérer
          
        })
      );
  
  }
  
  
  public getAllAppointmentType(): Observable<AppoitementType[]> {
    const token = localStorage.getItem('jwtToken'); // Récupère le token stocké
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Ajoute le token d'authentification
    });
  
    return this.http.get<AppoitementType[]>(this.matiereUrl, { headers }); // Correction ici
  }
  
 
   getAppById(id: number): Observable<AppoitementType> {
     return this.http.get<AppoitementType>(`${this.matiereUrl}/${id}`);
   }
   get refreshNeeded() {
    return this.refreshNeeded$;
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Docteur } from '../../models/docteur';
import { catchError, Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JwtService } from '../jwt/jwt.service';

@Injectable({
  providedIn: 'root'
})
export class DocteurService {

  private matiereUrl = "http://localhost:8080/medico/signup/docteur";
  
  constructor(
    private http: HttpClient,
    private jwtService: JwtService //  INJECTION du JwtService
  ) { }

  //  Méthode pour récupérer les headers avec le token
  private getHeaders(): HttpHeaders {
    const token = this.jwtService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  //  RÉCUPÉRER TOUS LES DOCTEURS AVEC AUTHENTIFICATION
  getAllDocteurs(): Observable<Docteur[]> {
    console.log('📋 Requête: Récupération de tous les docteurs avec authentification');
        const token = localStorage.getItem('token');
        //  Créer les headers avec le token
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });
    return this.http.get<Docteur[]>(
      `${this.matiereUrl}/all`,
      { headers: headers}
    ).pipe(
      tap(doctors => {
        console.log(' Docteurs récupérés:', doctors.length);
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des docteurs:', error);
        if (error.status === 401) {
          console.error('🔒 Token expiré ou invalide');
        } else if (error.status === 403) {
          console.error('🚫 Accès refusé');
        }
        return throwError(() => error);
      })
    );
  }

  //  RÉCUPÉRER UN DOCTEUR PAR ID
  getDocteurById(id: number): Observable<Docteur> {
    console.log('📋 Requête: Récupération du docteur ID:', id);
    
    return this.http.get<Docteur>(
      `${this.matiereUrl}/${id}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(doctor => {
        console.log(' Docteur récupéré:', doctor);
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération du docteur:', error);
        return throwError(() => error);
      })
    );
  }

  //  AJOUTER UN DOCTEUR
  addDocteur(docteur: Docteur): Observable<Docteur> {
    console.log('📋 Requête: Ajout d\'un nouveau docteur');
    
    return this.http.post<Docteur>(
      `${this.matiereUrl}/add`,
      docteur,
      { headers: this.getHeaders() }
    ).pipe(
      tap(doctor => {
        console.log(' Docteur ajouté:', doctor);
      }),
      catchError(error => {
        console.error('❌ Erreur lors de l\'ajout du docteur:', error);
        return throwError(() => error);
      })
    );
  }

  
  updateDocteurProfile(id: number, updates: Docteur): Observable<Docteur> {
    console.log('📝 Mise à jour du profil docteur ID:', id);
    
    return this.http.patch<Docteur>(
      `${this.matiereUrl}/update/${id}`,
      updates,
      { headers: this.getHeaders() }
    ).pipe(
      tap(doctor => {
        console.log(' Profil docteur mis à jour:', doctor);
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la mise à jour du profil:', error);
        return throwError(() => error);
      })
    );
  }

  //  SUPPRIMER UN DOCTEUR
  deleteDocteur(id: number): Observable<void> {
    console.log('📋 Requête: Suppression du docteur ID:', id);
    
    return this.http.delete<void>(
      `${this.matiereUrl}/delete/${id}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => {
        console.log(' Docteur supprimé');
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la suppression du docteur:', error);
        return throwError(() => error);
      })
    );
  }
}
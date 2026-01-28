import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { Creneau } from '../../models/Creneau';

@Injectable({
  providedIn: 'root'
})
export class CreneauService {
  
  private baseURL = 'http://localhost:8080/medico/api/creneaux';

  constructor(private http: HttpClient) {}

  //  Headers avec le token JWT
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('jwtToken');
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  //  RÉCUPÉRER MES CRÉNEAUX (docteur connecté)
  getMesCreneaux(): Observable<Creneau[]> {
        const token = localStorage.getItem('token');
        
        // ✅ Créer les headers avec le token
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });

    return this.http.get<Creneau[]>(`${this.baseURL}/mes-creneaux`, {
      headers: headers
    });
  }

  //  AJOUTER UN CRÉNEAU
  ajouterCreneau(creneau: Creneau): Observable<Creneau> {
    const token = localStorage.getItem('token');
        
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<Creneau>(this.baseURL, creneau, {
      headers: headers
    });
  }

  //  MODIFIER UN CRÉNEAU
  modifierCreneau(id: number, creneau: Creneau): Observable<Creneau> {
    const token = localStorage.getItem('token');
        
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<Creneau>(`${this.baseURL}/${id}`, creneau, {
      headers: headers
    });
  }

  //  SUPPRIMER UN CRÉNEAU
  supprimerCreneau(id: number): Observable<void> {
    const token = localStorage.getItem('token');
        
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<void>(`${this.baseURL}/${id}`, {
      headers: headers
    });
  }

  //  RÉCUPÉRER LES CRÉNEAUX D'UN DOCTEUR SPÉCIFIQUE (pour les patients)
  getCreneauxDocteur(docteurId: number): Observable<Creneau[]> {

    const token = localStorage.getItem('token');
        
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Creneau[]>(`${this.baseURL}/docteur/${docteurId}`,{
      headers: headers
    }).pipe(
      tap(creneaux => {
        console.log(' Réponse API reçue:', creneaux);
      }),
      catchError(error => {
        console.error('❌ Erreur API créneaux:', error);
        throw error;
      })
    );
  };
  }

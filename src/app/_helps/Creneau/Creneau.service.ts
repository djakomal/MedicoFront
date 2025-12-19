import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Creneau } from "../../models/Creneau";

@Injectable({
  providedIn: 'root'
})
export class CreneauService {
  
  private apiUrl = 'http://localhost:8080/medico/api/creneaux';
  
  constructor(private http: HttpClient) {}
  
  // Obtenir les headers avec le token JWT
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  
  // Récupérer tous les créneaux disponibles (pour les patients)
  getCreneauxDisponibles(): Observable<Creneau[]> {
    const token = localStorage.getItem('token');
    
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Creneau[]>(`${this.apiUrl}/disponibles`, { 
      headers: headers 
    });
  }
  
  // Récupérer les créneaux du docteur connecté
  getMesCreneaux(): Observable<Creneau[]> {
    const token = localStorage.getItem('token');
    
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Creneau[]>(`${this.apiUrl}/disponibles`, { 
      headers: headers 
    });
  }
  
  // Récupérer les créneaux d'un docteur spécifique
  getCreneauxByDoctor(doctorId: number): Observable<Creneau[]> {
    const token = localStorage.getItem('token');
    
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Creneau[]>(`${this.apiUrl}/doctor/${doctorId}`, { 
      headers: headers
    });
  }
  
  // Ajouter un créneau
  ajouterCreneau(creneau: Creneau): Observable<Creneau> {

    const token = localStorage.getItem('token');
    
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<Creneau>(`${this.apiUrl}`, creneau, { 
      headers: headers 
    });
  }
  
  // Modifier un créneau
  modifierCreneau(id: number, creneau: Creneau): Observable<Creneau> {

    const token = localStorage.getItem('token');
    
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<Creneau>(`${this.apiUrl}/${id}`, creneau, { 
      headers: headers 
    });
  }
  
  // Supprimer un créneau
  supprimerCreneau(id: number): Observable<void> {
    const token = localStorage.getItem('token');
    
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: headers 
    });
  }
  
  // Rendre un créneau indisponible
  rendreIndisponible(id: number): Observable<void> {

    const token = localStorage.getItem('token');
    
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<void>(`${this.apiUrl}/${id}/indisponible`, {}, { 
      headers: headers
    });
  }
}
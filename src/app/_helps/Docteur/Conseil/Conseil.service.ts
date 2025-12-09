
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conseil } from '../../../models/Conseil';

@Injectable({
  providedIn: 'root'
})
export class ConseilService {
  private baseUrl = 'http://localhost:8080/medico/api/conseils';

  constructor(private http: HttpClient) { }

  // Headers HTTP
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Créer un nouveau conseil
  creerConseil(conseil: Conseil): Observable<Conseil> {
    // ✅ Récupérer le token
    const token = localStorage.getItem('token');
    
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    console.log('🔑 Envoi requête avec token:', token);
    return this.http.post<Conseil>(this.baseUrl, conseil, { 
      headers:  headers 
    });
  }

  // Récupérer tous les conseils
  getAllConseils(): Observable<Conseil[]> {

    const token = localStorage.getItem('token');
    
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Conseil[]>(this.baseUrl, { headers });
  }

  // Récupérer les conseils publiés
  getConseilsPublies(): Observable<Conseil[]> {
    const token = localStorage.getItem('token');
    
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Conseil[]>(`${this.baseUrl}/publies`, { headers });
  }

  // Récupérer un conseil par ID
  getConseilById(id: number): Observable<Conseil> {
    const token = localStorage.getItem('token');
    
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Conseil>(`${this.baseUrl}/${id}`, { headers });
  }

  // Récupérer les   conseils par catégorie
  getConseilsByCategorie(categorie: string): Observable<Conseil[]> {
    const token = localStorage.getItem('token');
    
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Conseil[]>(`${this.baseUrl}/categorie/${categorie}`, { headers });
  }

  // Récupérer les conseils par auteur
  getConseilsByAuteur(auteur: string): Observable<Conseil[]> {
    const token = localStorage.getItem('token');
    
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Conseil[]>(`${this.baseUrl}/auteur/${auteur}`, { headers });
  }

  // Rechercher des conseils
  rechercherConseils(query: string): Observable<Conseil[]> {
    const token = localStorage.getItem('token');
    
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Conseil[]>(`${this.baseUrl}/recherche`, {
      headers,
      params: { query }
    });
  }

  // Mettre à jour un conseil
  updateConseil(id: number, conseil: Conseil): Observable<Conseil> {
    const token = localStorage.getItem('token');
    
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<Conseil>(`${this.baseUrl}/${id}`, conseil, {
      headers
    });
  }

  // Publier/Dépublier un conseil
  togglePublish(id: number): Observable<Conseil> {
    const token = localStorage.getItem('token');
    
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }); 
    return this.http.patch<Conseil>(`${this.baseUrl}/${id}/toggle-publish`, {}, { headers });
  }

  // Supprimer un conseil
  deleteConseil(id: number): Observable<void> {
    const token = localStorage.getItem('token');
    
    // ✅ Créer les headers avec le token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers });
  }
}
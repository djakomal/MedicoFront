
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
    return this.http.post<Conseil>(this.baseUrl, conseil, { 
      headers: this.getHeaders() 
    });
  }

  // Récupérer tous les conseils
  getAllConseils(): Observable<Conseil[]> {
    return this.http.get<Conseil[]>(this.baseUrl);
  }

  // Récupérer les conseils publiés
  getConseilsPublies(): Observable<Conseil[]> {
    return this.http.get<Conseil[]>(`${this.baseUrl}/publies`);
  }

  // Récupérer un conseil par ID
  getConseilById(id: number): Observable<Conseil> {
    return this.http.get<Conseil>(`${this.baseUrl}/${id}`);
  }

  // Récupérer les conseils par catégorie
  getConseilsByCategorie(categorie: string): Observable<Conseil[]> {
    return this.http.get<Conseil[]>(`${this.baseUrl}/categorie/${categorie}`);
  }

  // Récupérer les conseils par auteur
  getConseilsByAuteur(auteur: string): Observable<Conseil[]> {
    return this.http.get<Conseil[]>(`${this.baseUrl}/auteur/${auteur}`);
  }

  // Rechercher des conseils
  rechercherConseils(query: string): Observable<Conseil[]> {
    return this.http.get<Conseil[]>(`${this.baseUrl}/recherche`, {
      params: { query }
    });
  }

  // Mettre à jour un conseil
  updateConseil(id: number, conseil: Conseil): Observable<Conseil> {
    return this.http.put<Conseil>(`${this.baseUrl}/${id}`, conseil, {
      headers: this.getHeaders()
    });
  }

  // Publier/Dépublier un conseil
  togglePublish(id: number): Observable<Conseil> {
    return this.http.patch<Conseil>(`${this.baseUrl}/${id}/toggle-publish`, {});
  }

  // Supprimer un conseil
  deleteConseil(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
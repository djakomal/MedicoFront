import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Publication } from '../models/Publication';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {

  private baseUrl = 'http://localhost:8080/medico/api/publication';
 
   constructor(private http: HttpClient) { }
 
   // Headers HTTP
   private getHeaders(): HttpHeaders {
     return new HttpHeaders({
       'Content-Type': 'application/json'
     });
   }
 
   // Créer un nouveau Publication
   creerPublication(Publication: Publication): Observable<Publication> {
     // ✅ Récupérer le token
     const token = localStorage.getItem('token');
     
     // ✅ Créer les headers avec le token
     const headers = new HttpHeaders({
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     });
     console.log('🔑 Envoi requête avec token:', token);
     return this.http.post<Publication>(this.baseUrl, Publication, { 
       headers:  headers 
     });
   }

   creerPublicationAvecImage(formData: FormData): Observable<any> {
    // Ne pas définir Content-Type, Angular le fera automatiquement avec la boundary
    
    return this.http.post<any>(this.baseUrl, formData);
  }
    getPublicationsByDoctorId(doctorId:number):Observable<Publication>{
     // ✅ Récupérer le token
     const token = localStorage.getItem('token');
     
     // ✅ Créer les headers avec le token
     const headers = new HttpHeaders({
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     });
     return  this.http.get<Publication>(`${this.baseUrl}/doctor/${doctorId}`,
     {
       headers: headers
     });
    }
 
   // Récupérer tous les Publications
   getAllPublications(): Observable<Publication[]> {
 
     const token = localStorage.getItem('token');
     
     // ✅ Créer les headers avec le token
     const headers = new HttpHeaders({
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     });
     return this.http.get<Publication[]>(this.baseUrl, { headers :headers});
   }
 
   // Récupérer les Publications publiés
   getPublicationsPublies(): Observable<Publication[]> {
     const token = localStorage.getItem('token');
     
     // ✅ Créer les headers avec le token
     const headers = new HttpHeaders({
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     });
     return this.http.get<Publication[]>(`${this.baseUrl}/publies`, { headers });
   }
 
   // Récupérer un Publication par ID
   getPublicationById(id: number): Observable<Publication> {
     const token = localStorage.getItem('token');
     
     // ✅ Créer les headers avec le token
     const headers = new HttpHeaders({
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     });
     return this.http.get<Publication>(`${this.baseUrl}/${id}`, { headers });
   }
 
   // Récupérer les   Publications par catégorie
   getPublicationsByCategorie(categorie: string): Observable<Publication[]> {
     const token = localStorage.getItem('token');
     
     // ✅ Créer les headers avec le token
     const headers = new HttpHeaders({
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     });
     return this.http.get<Publication[]>(`${this.baseUrl}/categorie/${categorie}`, { headers });
   }
 
   // Récupérer les Publications par auteur
   getPublicationsByAuteur(auteur: string): Observable<Publication[]> {
     const token = localStorage.getItem('token');
     
     // ✅ Créer les headers avec le token
     const headers = new HttpHeaders({
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     });
     return this.http.get<Publication[]>(`${this.baseUrl}/auteur/${auteur}`, { headers });
   }
 
   // Rechercher des Publications
   rechercherPublications(query: string): Observable<Publication[]> {
     const token = localStorage.getItem('token');
     
     // ✅ Créer les headers avec le token
     const headers = new HttpHeaders({
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     });
     return this.http.get<Publication[]>(`${this.baseUrl}/recherche`, {
       headers,
       params: { query }
     });
   }
 
   // Mettre à jour un Publication
   updatePublication(id: number, Publication: Publication): Observable<Publication> {
     const token = localStorage.getItem('token');
     
     // ✅ Créer les headers avec le token
     const headers = new HttpHeaders({
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     });
     return this.http.put<Publication>(`${this.baseUrl}/${id}`, Publication, {
       headers
     });
   }
 
   // Publier/Dépublier un Publication
   togglePublish(id: number): Observable<Publication> {
     const token = localStorage.getItem('token');
     
     // ✅ Créer les headers avec le token
     const headers = new HttpHeaders({
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     }); 
     return this.http.patch<Publication>(`${this.baseUrl}/${id}/toggle-publish`, {}, { headers });
   }
 
   // Supprimer un Publication
   deletePublication(id: number): Observable<void> {
     const token = localStorage.getItem('token');
     
     // ✅ Créer les headers avec le token
     const headers = new HttpHeaders({
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     });
     return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers });
   }
}

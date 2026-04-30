
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conseil } from '../../../models/Conseil';
import { JwtService } from '../../jwt/jwt.service';

@Injectable({
  providedIn: 'root'
})
export class ConseilService {
  private baseUrl = 'http://localhost:8080/medico/api/conseils';

  constructor(private http: HttpClient,
    private jwtService: JwtService 
  ) { }

  // Headers HTTP
  private getHeaders(): HttpHeaders {
    const token = this.jwtService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Créer un nouveau conseil
  creerConseil(conseil: Conseil): Observable<Conseil> {
    
    return this.http.post<Conseil>(this.baseUrl, conseil, { 
      headers:  this.getHeaders() 
    });
  }
   getconseilsByDoctorId(doctorId:number):Observable<Conseil>{

    return  this.http.get<Conseil>(`${this.baseUrl}/doctor/${doctorId}`,
    {
      headers:this.getHeaders()
    });
   }

  
  getAllConseils(): Observable<Conseil[]> {

    return this.http.get<Conseil[]>(this.baseUrl, { headers :this.getHeaders()});
  }


  getConseilsPublies(): Observable<Conseil[]> {

    return this.http.get<Conseil[]>(`${this.baseUrl}/publies`);
  }

  // Récupérer un conseil par ID
  getConseilById(id: number): Observable<Conseil> {
 
    return this.http.get<Conseil>(`${this.baseUrl}/${id}`, { headers:this.getHeaders() });
  }

  // Récupérer les   conseils par catégorie
  getConseilsByCategorie(categorie: string): Observable<Conseil[]> {

    return this.http.get<Conseil[]>(`${this.baseUrl}/categorie/${categorie}`, { headers:this.getHeaders() });
  }

  // Récupérer les conseils par auteur
  getConseilsByAuteur(auteur: string): Observable<Conseil[]> {

    return this.http.get<Conseil[]>(`${this.baseUrl}/auteur/${auteur}`, { headers:this.getHeaders() });

  }

  getConseilByDocteur(id:number): Observable<Conseil> {

    return this.http.get<Conseil>(`${this.baseUrl}/docteur/${id}`, { headers:this.getHeaders() });

  }

  // Rechercher des conseils
  rechercherConseils(query: string): Observable<Conseil[]> {

    return this.http.get<Conseil[]>(`${this.baseUrl}/recherche`, {headers:
      this.getHeaders(),
      params: { query }
    });
  }

  // Mettre à jour un conseil
  updateConseil(id: number, conseil: Conseil): Observable<Conseil> {

    return this.http.put<Conseil>(`${this.baseUrl}/${id}`, conseil, {
    headers:this.getHeaders()
    });
  }

  // Publier/Dépublier un conseil
  togglePublish(id: number): Observable<Conseil> {

    return this.http.patch<Conseil>(`${this.baseUrl}/${id}/toggle-publish`, {}, { headers:this.getHeaders() });
  }

  // Supprimer un conseil
  deleteConseil(id: number): Observable<void> {

    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers:this.getHeaders()});
  }



}
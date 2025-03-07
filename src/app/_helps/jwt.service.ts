import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import axios, { Axios } from 'axios';

// const BASE_URL = "http://localhost:8080/tickets/"

@Injectable({
  providedIn: 'root',
})
export class JwtService {

  private tokenKey = 'authToken';
  private baseURL = 'http://localhost:8080/medico';
  constructor(private http: HttpClient) {
    axios.defaults.headers.post['Content-Type'] = 'application/json';
  }

  register(signRequest: any): Observable<any> {
    return this.http.post(this.baseURL + '/signup', signRequest);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(this.baseURL + '/login', credentials,
      {headers: new HttpHeaders({'Content-Type': 'application/json'})
    }).pipe(
      tap((response: any) =>console.log ("reponse du serveur :", response))
    ) ;
  }
  //  // Sauvegarder le token après connexion
  saveToken(token: string) {
    window.localStorage.setItem('jwtToken', token);
  }

  // Récupérer le token pour les requêtes protégées
  getToken(): string | null {
    return localStorage.getItem('authotoken');
  }

  setToken(token: string) {
    if (token == null) {
      localStorage.setItem('jwtToken', token);
    } else {
      localStorage.removeItem('jwtToken');
    }
  }
  getUserName(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1])); // Décoder le payload du JWT
      return tokenPayload.sub; // "sub" contient souvent l'email ou le nom d'utilisateur
    } catch (error) {
      console.error("Erreur lors du décodage du token :", error);
      return null;
    }
  }

  // }
  isTokenValid(): boolean {
    const jwtToken = localStorage.getItem('jwt');
    if (!jwtToken) {
      return false;
    }

    return true;
  }

  get(url: string): Observable<any> {
    const token = this.getToken();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : {};

    return this.http.get<any>(`${this.baseURL}${url}`, { headers });
  }
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  request(method: string, endpoint: string, data?: any): Observable<any> {
    const token = this.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http.request(method, `${this.baseURL}${endpoint}`, {
      body: data,
      headers: headers,
    });
  }
}

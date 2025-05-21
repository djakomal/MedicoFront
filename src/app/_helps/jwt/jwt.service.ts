import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import axios, { Axios } from 'axios';
import { Docteur } from '../../models/docteur';

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
    return this.http.post(this.baseURL + '/login/login', credentials,
      {headers: new HttpHeaders({'Content-Type': 'application/json'})
    }).pipe(
      tap((response: any) =>console.log ("reponse du serveur :", response))
    ) ;
  }
// docteur 
  loginDoc(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(this.baseURL + '/docteur/login', credentials,
      {headers: new HttpHeaders({'Content-Type': 'application/json'})
    }).pipe(
      tap((response: any) =>console.log ("reponse du serveur :", response))
    ) ;
  }

  registerDoc(signRequest: any): Observable<any> {
    return this.http.post(this.baseURL + '/signup/docteur/add', signRequest);
  }
    getAllDocteurs(): Observable<Docteur[]> {
    return this.http.get<Docteur[]>(this.baseURL + '/all', );
  }
  //  // Sauvegarder le token après connexion
  saveToken(jwt: string) {
    window.localStorage.setItem('jwtToken', jwt);
  }

  // Récupérer le token pour les requêtes protégées
  getToken(): string | null {
    const token = localStorage.getItem('jwtToken');
    console.log("🔍 Token récupéré :", token);
    return token;
  }
 
  setToken(jwt: string|null) {
    if (jwt) {
      localStorage.setItem('jwtToken', jwt);
    } else {
      localStorage.removeItem('jwtToken');
    }
  }
  getUserName(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        // Vérifie plusieurs champs possibles pour le username
        return decodedToken.preferred_username  || decodedToken.userName || decodedToken.name || decodedToken.sub || null;
      } catch (error) {
        console.error('Erreur lors du décodage du token JWT:', error);
        return null;
      }
    }
    return null;
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


  getDecodedToken(): any | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log('Contenu du token JWT:', decodedToken);
        return decodedToken;
      } catch (error) {
        console.error('Erreur lors du décodage du token JWT:', error);
        return null;
      }
    }
    return null;
  }
}
function jwtDecode(token: string): any {
  throw new Error('Function not implemented.');
}


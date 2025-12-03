import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode'; // ✅ Import correct
import { Docteur } from '../../models/docteur';

@Injectable({
  providedIn: 'root',
})
export class JwtService {

  private tokenKey = 'authToken'; // ✅ Utiliser le même nom partout
  private baseURL = 'http://localhost:8080/medico';

  constructor(private http: HttpClient) {}

  // 🔹 LOGIN UTILISATEUR
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(this.baseURL + '/login/login', credentials, {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    }).pipe(
      tap((response: any) => {
        console.log("✅ Réponse du serveur :", response);
        
        // ✅ Sauvegarder le token après connexion
        if (response && response.jwt) {
          this.saveToken(response.jwt);
        }
      })
    );
  }

  // 🔹 LOGIN DOCTEUR
  loginDoc(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(this.baseURL + '/docteur/login', credentials, {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    }).pipe(
      tap((response: any) => {
        console.log("✅ Réponse du serveur docteur :", response);
        
        if (response && response.jwt) {
          this.saveToken(response.jwt);
        }
      })
    );
  }

  // 🔹 SAUVEGARDER LE TOKEN
  saveToken(jwt: string): void {
    localStorage.setItem(this.tokenKey, jwt);
    console.log("💾 Token sauvegardé");
  }

  // 🔹 RÉCUPÉRER LE TOKEN
  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    console.log("🔍 Token récupéré :", token ? "Token présent" : "Aucun token");
    return token;
  }

  // 🔹 SUPPRIMER LE TOKEN (LOGOUT)
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    console.log("🗑️ Token supprimé");
  }

  // 🔹 DÉCODER LE TOKEN COMPLET
  getDecodedToken(): any | null {
    const token = this.getToken();
    
    if (!token) {
      console.warn("⚠️ Aucun token trouvé dans le localStorage");
      return null;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      console.log("📜 Contenu du token JWT :", decodedToken);
      return decodedToken;
    } catch (error) {
      console.error("❌ Erreur lors du décodage du token JWT :", error);
      return null;
    }
  }

  // 🔹 RÉCUPÉRER LE USERNAME DEPUIS LE TOKEN
  getUserName(): string | null {
    const decodedToken = this.getDecodedToken();
    
    if (!decodedToken) {
      return null;
    }

    // ✅ Vérifie plusieurs champs possibles
    const username = decodedToken.sub ||           // Standard JWT
                     decodedToken.username ||      // Champ custom
                     decodedToken.name ||          // Nom complet
                     decodedToken.email ||         // Email comme fallback
                     decodedToken.preferred_username || 
                     null;

    console.log("👤 Username récupéré :", username);
    return username;
  }

  // 🔹 VÉRIFIER SI LE TOKEN EST VALIDE
  isTokenValid(): boolean {
    const token = this.getToken();
    
    if (!token) {
      return false;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Vérifie si le token n'est pas expiré
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.warn("⚠️ Token expiré");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("❌ Token invalide :", error);
      return false;
    }
  }

  // 🔹 REQUÊTES AVEC AUTHENTIFICATION
  get(url: string): Observable<any> {
    const token = this.getToken();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();

    return this.http.get<any>(`${this.baseURL}${url}`, { headers });
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

  // 🔹 AUTRES MÉTHODES
  register(signRequest: any): Observable<any> {
    return this.http.post(this.baseURL + '/signup', signRequest);
  }

  registerDoc(signRequest: any): Observable<any> {
    return this.http.post(this.baseURL + '/signup/docteur/add', signRequest);
  }

  getAllDocteurs(): Observable<Docteur[]> {
    return this.http.get<Docteur[]>(this.baseURL + '/all');
  }
}
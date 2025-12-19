import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, throwError, BehaviorSubject, of, interval } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Docteur } from '../../models/docteur';
import { User } from '../../models/user';
import { Router } from '@angular/router';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  private tokenKey = 'authToken';
  private refreshTokenKey = 'refreshToken';
  private baseURL = 'http://localhost:8080/medico';
  
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log('🚀 Démarrage du système de rafraîchissement automatique');
    this.startAutoRefresh();
  }

  // ✅ SYSTÈME DE RAFRAÎCHISSEMENT AUTOMATIQUE
  // Vérifie toutes les 5 minutes et rafraîchit 5 minutes avant expiration
  private startAutoRefresh(): void {
    // NE PAS vérifier immédiatement au démarrage (laisse le temps de se connecter)
    // this.checkAndRefresh(); // ❌ ENLEVÉ

    // Vérifier toutes les 5 minutes (300000 ms)
    interval(300000).subscribe(() => {
      this.checkAndRefresh();
    });

    console.log('✅ Système de rafraîchissement automatique activé (vérification toutes les 5 min)');
  }

  // ✅ VÉRIFIER ET RAFRAÎCHIR SI NÉCESSAIRE
  private checkAndRefresh(): void {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    // Pas de token = pas connecté
    if (!token || !refreshToken) {
      return;
    }

    // Token déjà en cours de rafraîchissement
    if (this.isRefreshing) {
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const exp = decoded.exp * 1000; // ✅ CORRECTION: multiplier par 1000, pas 6000000
      const now = Date.now();
      const timeLeft = exp - now;
      const minutesLeft = Math.floor(timeLeft / 60000); // ✅ CORRECTION: diviser par 60000 (60s * 1000ms)

      // ✅ SI MOINS DE 5 MINUTES RESTANTES → RAFRAÎCHIR AUTOMATIQUEMENT
      if (minutesLeft <= 5 && minutesLeft > 0) {
        console.log(`⚠️ Token expire dans ${minutesLeft} minutes - RAFRAÎCHISSEMENT AUTOMATIQUE...`);
        this.doRefresh();
      }
      // ✅ SI TOKEN EXPIRÉ → RAFRAÎCHIR IMMÉDIATEMENT
      else if (timeLeft <= 0) {
        console.log('❌ Token expiré - RAFRAÎCHISSEMENT AUTOMATIQUE IMMÉDIAT...');
        this.doRefresh();
      }
      // Token OK
      else if (minutesLeft > 5) {
        // Log uniquement toutes les minutes pour ne pas polluer
        if (minutesLeft % 10 === 0) {
          console.log(`✅ Token valide - ${minutesLeft} minutes restantes`);
        }
      }

    } catch (error) {
      console.error('❌ Erreur de vérification du token:', error);
    }
  }

  // ✅ EFFECTUER LE RAFRAÎCHISSEMENT
  private doRefresh(): void {
    if (this.isRefreshing) {
      return;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.error('❌ Pas de refresh token - déconnexion');
      this.handleLogout();
      return;
    }

    this.isRefreshing = true;
    console.log('🔄 RAFRAÎCHISSEMENT EN COURS...');

    this.http.post(`${this.baseURL}/login/refresh-token`, { refreshToken }, {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    }).subscribe({
      next: (response: any) => {
        if (response && response.jwt) {
          this.saveToken(response.jwt);
          
          if (response.refreshToken) {
            this.saveRefreshToken(response.refreshToken);
          }

          console.log('✅ TOKEN RAFRAÎCHI AUTOMATIQUEMENT AVEC SUCCÈS !');
          this.refreshTokenSubject.next(response.jwt);
        }
        this.isRefreshing = false;
      },
      error: (error) => {
        console.error('❌ Échec du rafraîchissement:', error);
        this.isRefreshing = false;
        this.handleLogout();
      }
    });
  }

  // ✅ DÉCONNEXION
  private handleLogout(): void {
    console.warn('⚠️ Session expirée - redirection vers login');
    this.removeToken();
    this.router.navigateByUrl('/connex');
  }

  // 🔹 LOGIN UTILISATEUR
  login(credentials: { username: string; password: string }): Observable<any> {
    const normalizedCredentials = {
      ...credentials,
      email: credentials.username.trim().toLowerCase()
    };

    return this.http.post(this.baseURL + '/login/login', normalizedCredentials, {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    }).pipe(
      tap((response: any) => {
        console.log("✅ Login réussi");
        
        if (response && response.jwt) {
          this.saveToken(response.jwt);
          
          if (response.refreshToken) {
            this.saveRefreshToken(response.refreshToken);
          }
        }
      }),
      catchError(error => {
        console.error('❌ Erreur de connexion:', error);
        return throwError(() => error);
      })
    );
  }

  // 🔹 LOGIN DOCTEUR
  loginDoc(credentials: { username: string; password: string }): Observable<any> {
    const normalizedCredentials = {
      ...credentials,
      username: credentials.username.trim().toLowerCase()
    };

    return this.http.post(this.baseURL + '/docteur/login', normalizedCredentials, {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    }).pipe(
      tap((response: any) => {
        console.log("✅ Login docteur réussi");
        
        if (response && response.jwt) {
          this.saveToken(response.jwt);
          
          if (response.refreshToken) {
            this.saveRefreshToken(response.refreshToken);
          }
        }
      }),
      catchError(error => {
        console.error('❌ Erreur de connexion docteur:', error);
        return throwError(() => error);
      })
    );
  }

  // 🔹 SAUVEGARDER LE TOKEN
  saveToken(jwt: string): void {
    localStorage.setItem(this.tokenKey, jwt);
    localStorage.setItem('token', jwt);
    localStorage.setItem('jwtToken', jwt);
    console.log("💾 Token sauvegardé");
  }

  // 🔹 SAUVEGARDER LE REFRESH TOKEN
  saveRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    console.log("💾 Refresh token sauvegardé");
  }

  // 🔹 RÉCUPÉRER LE TOKEN
  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey) || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('jwtToken');
    return token;
  }

  // 🔹 RÉCUPÉRER LE REFRESH TOKEN
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  // 🔹 SUPPRIMER LES TOKENS
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('token');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem(this.refreshTokenKey);
    this.isRefreshing = false;
    console.log("🗑️ Tokens supprimés");
  }

  // 🔹 DÉCODER LE TOKEN
  getDecodedToken(): any | null {
    const token = this.getToken();
    
    if (!token) {
      return null;
    }

    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  }

  // 🔹 RÉCUPÉRER LE USERNAME
  getUserName(): string | null {
    const decodedToken = this.getDecodedToken();
    
    if (!decodedToken) {
      return null;
    }

    return decodedToken.sub ||
           decodedToken.username ||
           decodedToken.name ||
           decodedToken.email ||
           decodedToken.preferred_username || 
           null;
  }

  // 🔹 VÉRIFIER SI LE TOKEN EST EXPIRÉ
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const decodedToken: any = jwtDecode(token);
      if (!decodedToken.exp) return true;

      const expirationDate = new Date(decodedToken.exp * 1000);
      const now = new Date();
      
      return expirationDate.getTime() <= now.getTime();
    } catch (error) {
      return true;
    }
  }

  // 🔹 VÉRIFIER SI LE TOKEN EST VALIDE
  isTokenValid(): boolean {
    return !this.isTokenExpired();
  }

  // 🔹 VÉRIFIER SI L'UTILISATEUR EST CONNECTÉ
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }

  // 🔹 REQUÊTES HTTP AVEC AUTO-REFRESH
  get(url: string): Observable<any> {
    return this.ensureValidToken().pipe(
      switchMap(() => {
        const token = this.getToken();
        const headers = token
          ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
          : new HttpHeaders();

        return this.http.get<any>(`${this.baseURL}${url}`, { headers });
      })
    );
  }

  request(method: string, endpoint: string, data?: any): Observable<any> {
    return this.ensureValidToken().pipe(
      switchMap(() => {
        const token = this.getToken();
        const headers = token
          ? new HttpHeaders({ Authorization: `Bearer ${token}` })
          : new HttpHeaders();

        return this.http.request(method, `${this.baseURL}${endpoint}`, {
          body: data,
          headers: headers,
        });
      })
    );
  }

  // ✅ S'ASSURER QUE LE TOKEN EST VALIDE AVANT LA REQUÊTE
  private ensureValidToken(): Observable<any> {
    const token = this.getToken();
    
    if (!token) {
      return of(null);
    }

    // Si le token est expiré ou expire bientôt, rafraîchir d'abord
    try {
      const decoded: any = jwtDecode(token);
      const exp = decoded.exp * 1000; // ✅ CORRECTION
      const now = Date.now();
      const minutesLeft = Math.floor((exp - now) / 60000); // ✅ CORRECTION

      if (minutesLeft <= 5) {
        console.log('🔄 Token expire bientôt - rafraîchissement avant requête');
        
        if (this.isRefreshing) {
          // Attendre que le rafraîchissement en cours se termine
          return this.refreshTokenSubject.pipe(
            switchMap(token => token ? of(token) : of(null))
          );
        }
        
        this.doRefresh();
        return this.refreshTokenSubject.pipe(
          switchMap(token => token ? of(token) : of(null))
        );
      }
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
    }

    return of(token);
  }

  // 🔹 AUTRES MÉTHODES
  getAllUser(): Observable<User[]> {
    return this.http.get<User[]>(this.baseURL + '/signup');
  }

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
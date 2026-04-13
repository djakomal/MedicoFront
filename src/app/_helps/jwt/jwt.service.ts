import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, throwError, BehaviorSubject, of, interval } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Docteur } from '../../models/docteur';
import { User } from '../../models/user';
import { Router } from '@angular/router';
import { catchError, map, switchMap } from 'rxjs/operators';

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
    console.log(' Démarrage du système de rafraîchissement automatique');
    this.startAutoRefresh();
  }

   startAutoRefresh(): void {
    interval(300000).subscribe(() => {
      this.checkAndRefresh();
    });
    console.log(' Système de rafraîchissement automatique activé');
  }

   checkAndRefresh(): void {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (!token || !refreshToken || this.isRefreshing) {
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const exp = decoded.exp * 1000;
      const now = Date.now();
      const timeLeft = exp - now;
      const minutesLeft = Math.floor(timeLeft / 60000);

      if (minutesLeft <= 5 && minutesLeft > 0) {
        console.log(` Token expire dans ${minutesLeft} minutes - RAFRAÎCHISSEMENT...`);
        this.doRefresh();
      } else if (timeLeft <= 0) {
        console.log(' Token expiré - RAFRAÎCHISSEMENT IMMÉDIAT...');
        this.doRefresh();
      }
    } catch (error) {
      console.error(' Erreur de vérification du token:', error);
    }
  }

   doRefresh(): void {
    if (this.isRefreshing) return;

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.error(' Pas de refresh token - déconnexion');
      this.handleLogout();
      return;
    }

    this.isRefreshing = true;
    console.log(' RAFRAÎCHISSEMENT EN COURS...');

    this.http.post(`${this.baseURL}/login/refresh-token`, { refreshToken }, {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    }).subscribe({
      next: (response: any) => {
        if (response && response.jwt) {
          this.saveToken(response.jwt);
          if (response.refreshToken) {
            this.saveRefreshToken(response.refreshToken);
          }
          console.log(' TOKEN RAFRAÎCHI AVEC SUCCÈS !');
          this.refreshTokenSubject.next(response.jwt);
        }
        this.isRefreshing = false;
      },
      error: (error) => {
        console.error(' Échec du rafraîchissement:', error);
        this.isRefreshing = false;
        this.handleLogout();
      }
    });
  }

   handleLogout(): void {
    console.warn(' Session expirée - redirection vers login');
    this.removeToken();
    this.router.navigateByUrl('/connex');
  }



  getDocteurImage(id: number): Observable<string> {
    const token = this.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  
    return this.http.get(`${this.baseURL}/signup/docteur/image/${id}`, {
      headers,
      responseType: 'blob'   // ← blob au lieu de text
    }).pipe(
      map((blob: Blob) => URL.createObjectURL(blob))  // ← convertit en URL affichable
    );
  }
  login(credentials: { username: string; password: string }): Observable<any> {
    const loginData = {
      username: credentials.username.trim().toLowerCase(),
      password: credentials.password,
    };
    return this.http.post(this.baseURL + '/login', loginData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap((response: any) => {
        if (response?.jwt) {
          
          this.removeToken();
          
          this.saveToken(response.jwt);
          if (response.refreshToken) this.saveRefreshToken(response.refreshToken);
          const role = (response.role as string)?.replace('ROLE_', '') ?? 'PATIENT';
          localStorage.setItem('userRole', role);
          localStorage.setItem('user_id', response.userId?.toString());
        }
      }),
      catchError(error => throwError(() => error))
    );
  }
  
  loginDoc(credentials: { username: string; password: string }): Observable<any> {
    const loginData = {
      username: credentials.username.trim().toLowerCase(),
      password: credentials.password,
    };
    return this.http.post(this.baseURL + '/docteur/login', loginData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap((response: any) => {
        if (response?.jwt) {
         
          this.removeToken();
  
          this.saveToken(response.jwt);
          if (response.refreshToken) this.saveRefreshToken(response.refreshToken);
  
         
          const role = (response.role as string)?.replace('ROLE_', '') ?? 'DOCTOR';
          localStorage.setItem('userRole', role);
          localStorage.setItem('user_id', response.userId?.toString());
        }
      }),
      catchError(error => throwError(() => error))
    );
  }
  // 🔹 SAUVEGARDER LE TOKEN
  saveToken(jwt: string): void {
    localStorage.setItem(this.tokenKey, jwt);
    localStorage.setItem('token', jwt);
    localStorage.setItem('jwtToken', jwt);
    console.log(" Token sauvegardé");
  }

  // 🔹 SAUVEGARDER LE REFRESH TOKEN
  saveRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    console.log(" Refresh token sauvegardé");
  }

 
activateAccount(payload: { code: string }): Observable<any> {
  return this.http.post(
    this.baseURL + '/signup/code-activation',
    payload,
    { headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      responseType: 'text' }   
  );
}



  // 🔹 RÉCUPÉRER LE TOKEN
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) || 
           localStorage.getItem('token') || 
           localStorage.getItem('jwtToken');
  }

  // RÉCUPÉRER LE REFRESH TOKEN
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }   

  getUserId(): number | null {
    const decodedToken = this.getDecodedToken();
    if (!decodedToken) {
      return null;
    }
    return  decodedToken.userId ;
  }

  getUserRole(): string | null {
    
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      return storedRole;
    }
    const decoded = this.getDecodedToken();
    if (decoded) {
      if (decoded.role) {
        return decoded.role;
      }
      if (decoded.authorities) {
        if (Array.isArray(decoded.authorities)) {
          const authority = decoded.authorities.find((auth: any) => 
            typeof auth === 'string' ? 
              (auth === 'ROLE_DOCTOR' || auth === 'ROLE_USER') :
              (auth.authority === 'ROLE_DOCTOR' || auth.authority === 'ROLE_USER')
          );
          
          if (authority) {
            const role = typeof authority === 'string' ? 
              authority.replace('ROLE_', '') : 
              authority.authority.replace('ROLE_', '');
            return role;
          }
        }
      }
    }

    return null;
  }

  getEmail(): string | null {
    const decodedToken = this.getDecodedToken();
    
    if (!decodedToken) {
      return null;
    }

    return decodedToken.email ||
           decodedToken.sub ||
           null;
  }


  isDoctor(): boolean {
    return this.getUserRole() === 'DOCTOR';
  }
  getDoctorId(): number | null {
    const decodedToken = this.getDecodedToken();
    if (!decodedToken) return null;

    return decodedToken.userId || null;
  }
  isUser(): boolean {
    return this.getUserRole() === 'USER';
  }
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('token');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem('userRole');
    this.isRefreshing = false;
    console.log("🗑️ Tokens supprimés");
  }
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
 getDoctortype():string |null {
   const decodedToken = this.getDecodedToken();
    
    if (!decodedToken) {
      return null;
    }

    return decodedToken.doctorType ||
            null;

 }
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

  isTokenValid(): boolean {
    return !this.isTokenExpired();
  }
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }
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

 ensureValidToken(): Observable<any> {
    const token = this.getToken();
    
    if (!token) {
      return of(null);
    }

    try {
      const decoded: any = jwtDecode(token);
      const exp = decoded.exp * 1000;
      const now = Date.now();
      const minutesLeft = Math.floor((exp - now) / 60000);

      if (minutesLeft <= 5) {
        console.log('🔄 Token expire bientôt - rafraîchissement avant requête');
        
        if (this.isRefreshing) {
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
  changePasswordDocteur(payload: {
    ancienMotDePasse: string;
    nouveauMotDePasse: string;
    confirmation: string;
  }): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(
      `${this.baseURL}/signup/docteur/change-password`,
      payload,
      { headers, responseType: 'text' }
    );
  }
  register(signRequest: any): Observable<any> {
    return this.http.post(this.baseURL + '/signup', signRequest);
  }

  registerDoc(signRequest: Docteur): Observable<any> {
    return this.http.post(this.baseURL + '/signup/docteur/add', signRequest);
  }

  getAllDocteurs(): Observable<Docteur[]> {
    return this.http.get<Docteur[]>(this.baseURL + '/all');
  }

}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ZoomMeeting {
  id: string;
  topic: string;
  start_time: string;
  join_url: string;
  start_url: string;
  password?: string;
  duration?: number;
  created_at?: string;
}

export interface CreateMeetingRequest {
  topic: string;
  type?: number; // 1=instant, 2=schedule, 3=recurring, 8=fixed webinar
  start_time?: string; // ISO 8601
  duration?: number;
  timezone?: string;
  agenda?: string;
  settings?: {
    host_video?: boolean;
    participant_video?: boolean;
    join_before_host?: boolean;
    waiting_room?: boolean;
    meeting_authentication?: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/medico/api/meetings'; // Ton backend Spring Boot
  private zoomAuthState = 'zoom_auth_state';
  private zoomTokenKey = 'zoom_access_token';
  private zoomUserKey = 'zoom_user_info';

  constructor(private http: HttpClient) {}

  // ==================== AUTHENTIFICATION ====================

  /**
   * Vérifier si l'utilisateur est authentifié avec Zoom
   */
  isZoomAuthenticated(): Observable<boolean> {
    // Vérifier d'abord dans le localStorage
    const token = localStorage.getItem(this.zoomTokenKey);
    if (!token) {
      return of(false);
    }

    // Vérifier avec le backend
    return this.http.get(`${this.baseUrl}/me`, {
      headers: this.getAuthHeaders(token)
    }).pipe(
      map(() => true),
      catchError(() => {
        // Token invalide ou expiré
        localStorage.removeItem(this.zoomTokenKey);
        localStorage.removeItem(this.zoomUserKey);
        return of(false);
      })
    );
  }

  /**
   * Obtenir l'URL d'authentification Zoom
   */
  getZoomAuthUrl(): string {
    return `${this.baseUrl}/authorize`;
  }

  /**
   * Lancer le flux d'authentification OAuth
   */
  initiateZoomAuth(): void {
    window.location.href = this.getZoomAuthUrl();
  }

  /**
   * Rafraîchir le token Zoom
   */
  refreshZoomToken(): Observable<any> {
    return this.http.post(`${this.baseUrl}/refresh-token`, {}).pipe(
      tap((response: any) => {
        if (response.access_token) {
          localStorage.setItem(this.zoomTokenKey, response.access_token);
        }
      }),
      catchError(error => {
        console.error('Erreur rafraîchissement token:', error);
        this.clearZoomAuth();
        throw error;
      })
    );
  }

  /**
   * Gérer le callback OAuth (à appeler après redirection)
   */
  handleZoomCallback(code: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/callback`, {
      params: { code }
    }).pipe(
      tap((response: any) => {
        // Stocker le token si présent dans la réponse
        if (response.token) {
          localStorage.setItem(this.zoomTokenKey, response.token);
        }
      })
    );
  }

  /**
   * Déconnecter Zoom
   */
  logoutZoom(): void {
    this.clearZoomAuth();
  }

  // ==================== GESTION DES RÉUNIONS ====================

  /**
   * Créer une réunion instantanée
   */
  createInstantMeeting(topic: string): Observable<ZoomMeeting> {
    const request: CreateMeetingRequest = {
      topic: topic,
      type: 1, // Réunion instantanée
      duration: 60,
      settings: {
        host_video: true,
        participant_video: true,
        waiting_room: true,
        join_before_host: false,
        meeting_authentication: true
      }
    };

    return this.http.post<ZoomMeeting>(this.baseUrl, request);
  }

  /**
   * Créer une réunion planifiée
   */
  createScheduledMeeting(topic: string, startTime: string, duration: number = 60): Observable<ZoomMeeting> {
    const request: CreateMeetingRequest = {
      topic: topic,
      type: 2, // Réunion planifiée
      start_time: startTime,
      duration: duration,
      timezone: 'Europe/Paris',
      settings: {
        host_video: true,
        participant_video: true,
        waiting_room: true,
        join_before_host: false,
        meeting_authentication: true
      }
    };

    return this.http.post<ZoomMeeting>(this.baseUrl, request);
  }

  /**
   * Obtenir toutes les réunions
   */
  getAllMeetings(): Observable<ZoomMeeting[]> {
    return this.http.get<ZoomMeeting[]>(this.baseUrl);
  }

  /**
   * Obtenir une réunion spécifique
   */
  getMeetingById(meetingId: string): Observable<ZoomMeeting> {
    return this.http.get<ZoomMeeting>(`${this.baseUrl}/${meetingId}`);
  }

  /**
   * Mettre à jour une réunion
   */
  updateMeeting(meetingId: string, updates: Partial<CreateMeetingRequest>): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${meetingId}`, updates);
  }

  /**
   * Supprimer une réunion
   */
  deleteMeeting(meetingId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${meetingId}`);
  }

  /**
   * Inscrire un participant à une réunion
   */
  registerToMeeting(meetingId: string, registrant: {
    email: string;
    firstName: string;
    lastName: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, {
      ...registrant,
      meetingId: meetingId
    });
  }

  // ==================== UTILITAIRES ====================

  /**
   * Ouvrir une réunion Zoom
   */
  openZoomMeeting(joinUrl: string): void {
    if (joinUrl) {
      window.open(joinUrl, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Générer une invitation Zoom formatée
   */
  generateZoomInvitation(meeting: ZoomMeeting): string {
    return `
      📅 Rendez-vous médical via Zoom
      
      Sujet: ${meeting.topic}
      Lien de participation: ${meeting.join_url}
      ${meeting.password ? `Mot de passe: ${meeting.password}` : ''}
      ${meeting.start_time ? `Heure: ${new Date(meeting.start_time).toLocaleString('fr-FR')}` : ''}
      ${meeting.duration ? `Durée: ${meeting.duration} minutes` : ''}
      
      Instructions:
      1. Cliquez sur le lien ci-dessus
      2. Installez l'application Zoom si nécessaire
      3. Rejoignez la réunion quelques minutes avant l'heure prévue
      
      Pour toute assistance, contactez votre médecin.
    `;
  }

  /**
   * Copier le lien Zoom dans le presse-papier
   */
  copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
  }

  /**
   * Obtenir les informations de l'utilisateur Zoom
   */
  getZoomUserInfo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`);
  }

  // ==================== MÉTHODES PRIVÉES ====================

  private getAuthHeaders(token?: string): HttpHeaders {
    const accessToken = token || localStorage.getItem(this.zoomTokenKey);
    return new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });
  }

  private clearZoomAuth(): void {
    localStorage.removeItem(this.zoomTokenKey);
    localStorage.removeItem(this.zoomUserKey);
    localStorage.removeItem(this.zoomAuthState);
  }

  private saveZoomToken(token: string, expiresIn: number): void {
    localStorage.setItem(this.zoomTokenKey, token);
    
    // Stocker la date d'expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
    localStorage.setItem('zoom_token_expires', expiresAt.toISOString());
  }

  private isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('zoom_token_expires');
    if (!expiresAt) return true;
    
    return new Date() >= new Date(expiresAt);
  }

  /**
   * Vérifier et rafraîchir automatiquement le token si nécessaire
   */
  ensureValidToken(): Observable<string> {
    return new Observable(observer => {
      const token = localStorage.getItem(this.zoomTokenKey);
      
      if (!token || this.isTokenExpired()) {
        this.refreshZoomToken().subscribe({
          next: (response) => {
            const newToken = response.access_token;
            observer.next(newToken);
            observer.complete();
          },
          error: (error) => {
            observer.error(error);
          }
        });
      } else {
        observer.next(token);
        observer.complete();
      }
    });
  }
}
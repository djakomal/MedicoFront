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
  type?: number;
  start_time?: string;
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
export class ZoomServiceService {
  private baseUrl = 'http://localhost:8080/medico/api/meetings';
  private zoomAuthState = 'zoom_auth_state';
  private zoomTokenKey = 'zoom_access_token';
  private zoomUserKey = 'zoom_user_info';

  constructor(private http: HttpClient) {}

  // ==================== AUTHENTIFICATION ====================

  isZoomAuthenticated(): Observable<boolean> {
    return this.http.get<{ authenticated: boolean }>(`${this.baseUrl}/me`).pipe(
      map(response => response.authenticated === true),
      catchError(() => of(false))
    );
  }

  getZoomAuthUrl(): Observable<{ authUrl: string }> {
    return this.http.get<{ authUrl: string }>(`${this.baseUrl}/authorize`).pipe(
      catchError(error => {
        console.error('Erreur génération URL auth:', error);
        throw error;
      })
    );
  }

  refreshZoomToken(): Observable<any> {
    return this.http.post(`${this.baseUrl}/refresh-token`, {}).pipe(
      catchError(error => {
        console.error('Erreur rafraîchissement token:', error);
        this.clearZoomAuth();
        throw error;
      })
    );
  }

  handleZoomCallback(code: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/callback`, { params: { code } });
  }

  logoutZoom(): void {
    this.clearZoomAuth();
  }

  // ==================== GESTION DES RÉUNIONS ====================

  createScheduledMeeting(topic: string, startTime: string, duration: number = 60): Observable<ZoomMeeting> {
    const request: CreateMeetingRequest = {
      topic,
      type: 2,
      start_time: startTime,
      duration,
      timezone: 'Africa/Lome',
      settings: {
        host_video: true,
        participant_video: true,
        waiting_room: true,          // ← patient attend
        join_before_host: false,     // ← docteur doit ouvrir en premier
        meeting_authentication: false,
        auto_recording: 'none'
      }
    };
    return this.http.post<ZoomMeeting>(this.baseUrl, request);
  }

  getAllMeetings(): Observable<ZoomMeeting[]> {
    return this.http.get<ZoomMeeting[]>(this.baseUrl);
  }

  getMeetingById(meetingId: string): Observable<ZoomMeeting> {
    return this.http.get<ZoomMeeting>(`${this.baseUrl}/${meetingId}`);
  }

  updateMeeting(meetingId: string, updates: Partial<CreateMeetingRequest>): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${meetingId}`, updates);
  }

  deleteMeeting(meetingId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${meetingId}`);
  }

  registerToMeeting(meetingId: string, registrant: {
    email: string;
    firstName: string;
    lastName: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, { ...registrant, meetingId });
  }

  // ==================== UTILITAIRES ====================

  openZoomMeeting(joinUrl: string): void {
    if (joinUrl) {
      window.open(joinUrl, '_blank', 'noopener,noreferrer');
    }
  }

  copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
  }

  getZoomUserInfo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`);
  }

  generateZoomInvitation(meeting: ZoomMeeting): string {
    return `
📅 Rendez-vous médical via Zoom

Sujet: ${meeting.topic}
Lien: ${meeting.join_url}
${meeting.password ? `Mot de passe: ${meeting.password}` : ''}
${meeting.start_time ? `Heure: ${new Date(meeting.start_time).toLocaleString('fr-FR')}` : ''}
${meeting.duration ? `Durée: ${meeting.duration} minutes` : ''}

Instructions:
1. Cliquez sur le lien ci-dessus
2. Installez Zoom si nécessaire
3. Rejoignez quelques minutes avant l'heure prévue
    `.trim();
  }

  // ==================== MÉTHODES PRIVÉES ====================

  private clearZoomAuth(): void {
    localStorage.removeItem(this.zoomTokenKey);
    localStorage.removeItem(this.zoomUserKey);
    localStorage.removeItem(this.zoomAuthState);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';


export interface ZoomMeeting {
  id: string;
  topic: string;
  join_url: string;
  start_url?: string;
  start_time?: string;
  duration?: number;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ZoomSimpleService {
  private zoomApiUrl = 'http://localhost:8080/medico/api/meetings'; // URL de votre backend

  constructor(private http: HttpClient) {}

  /**
   * Créer une réunion instantanée
   */
  createInstantMeeting(topic: string): Observable<ZoomMeeting> {
    const meetingData = {
      topic: topic,
      startTime: new Date().toISOString(), // Commence immédiatement
      duration: 60, // 60 minutes
      timezone: 'Africa/Douala'
    };

    return this.http.post<ZoomMeeting>(this.zoomApiUrl, meetingData)
      .pipe(
        catchError(error => {
          console.error('Erreur création meeting Zoom:', error);
          return throwError(() => new Error('Échec de la création de la réunion Zoom'));
        })
      );
  }

  /**
   * Créer une réunion planifiée
   */
  createScheduledMeeting(topic: string, startTime: string, duration: number = 60): Observable<ZoomMeeting> {
    const meetingData = {
      topic: topic,
      startTime: startTime,
      duration: duration,
      timezone: 'Africa/Douala'
    };

    return this.http.post<ZoomMeeting>(this.zoomApiUrl, meetingData)
      .pipe(
        catchError(error => {
          console.error('Erreur création meeting planifié Zoom:', error);
          return throwError(() => new Error('Échec de la création de la réunion planifiée'));
        })
      );
  }

  /**
   * Ouvrir la réunion Zoom dans une nouvelle fenêtre
   */
  openZoomMeeting(joinUrl: string): void {
    if (joinUrl) {
      window.open(joinUrl, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Obtenir l'URL d'authentification Zoom
   */
  getZoomAuthUrl(): string {
    return `${this.zoomApiUrl}/authorize`;
  }

  /**
   * Vérifier si Zoom est authentifié
   */
  isZoomAuthenticated(): Observable<boolean> {
    return new Observable(observer => {
      this.http.get(`${this.zoomApiUrl}/me`, { observe: 'response' })
        .subscribe({
          next: (response) => {
            observer.next(response.status === 200);
            observer.complete();
          },
          error: () => {
            observer.next(false);
            observer.complete();
          }
        });
    });
  }

  /**
   * Rafraîchir le token Zoom
   */
  refreshZoomToken(): Observable<any> {
    return this.http.post(`${this.zoomApiUrl}/refresh-token`, {})
      .pipe(
        catchError(error => {
          console.error('Erreur rafraîchissement token Zoom:', error);
          return throwError(() => new Error('Échec du rafraîchissement du token'));
        })
      );
  }
}
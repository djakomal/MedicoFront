import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtService } from './jwt/jwt.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private jwtService: JwtService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    // ✅ Ignorer les endpoints publics
    if (this.isPublicUrl(request.url)) {
      return next.handle(request);
    }

    // ✅ Ajouter automatiquement le token
    const token = this.jwtService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // ✅ Gérer les erreurs 401
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn('⚠️ Erreur 401 détectée');
          // Le système auto-refresh s'occupera du rafraîchissement
          // Pas besoin de logique complexe ici
        }
        return throwError(() => error);
      })
    );
  }

  private isPublicUrl(url: string): boolean {
    const publicUrls = [
      '/login/login',
      '/login/refresh-token',
      '/signup',
      '/docteur/login'
    ];
    return publicUrls.some(publicUrl => url.includes(publicUrl));
  }
}
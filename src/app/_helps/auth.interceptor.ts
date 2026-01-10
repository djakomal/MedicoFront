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

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('authToken') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('jwtToken');

                  // ✅ Ignorer les endpoints publics
     if (this.isPublicUrl(req.url)) {
       return next.handle(req);
       }
          
    if (token) {
      console.log('🔐 Interceptor: Ajout du token à la requête', req.url);
      
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return next.handle(clonedRequest);
    }
    
    return next.handle(req);
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
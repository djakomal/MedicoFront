import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { JwtService } from '../jwt/jwt.service';

/**
 * ✅ Guard d'authentification simple
 * Vérifie uniquement si l'utilisateur est connecté
 */
export const authGuard: CanActivateFn = (route, state) => {
  const jwtService = inject(JwtService);
  const router = inject(Router);

  if (jwtService.isTokenValid()) {
    return true;
  } else {
    console.warn('🚫 Non authentifié - redirection vers login');
    router.navigateByUrl("connex");
    return false;
  }
};

/**
 * ✅ Guard de rôle
 * Vérifie si l'utilisateur a le bon rôle pour accéder à la route
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const jwtService = inject(JwtService);
  const router = inject(Router);

  // Vérifier d'abord l'authentification
  if (!jwtService.isTokenValid()) {
    console.warn('🚫 Non authentifié - redirection vers login');
    router.navigateByUrl("connex");
    return false;
  }

  // Récupérer le rôle requis depuis les données de la route
  const requiredRole = route.data['role'] as string;

  // Si pas de rôle spécifié, autoriser l'accès
  if (!requiredRole) {
    return true;
  }

  // Vérifier le rôle de l'utilisateur
  const userRole = jwtService.getUserRole();

  if (userRole === requiredRole) {
    console.log(`✅ Accès autorisé - Rôle: ${userRole}`);
    return true;
  }

  // Rôle incorrect - rediriger vers le bon dashboard
  console.warn(`🚫 Accès refusé - Rôle requis: ${requiredRole}, Rôle actuel: ${userRole}`);
  
  if (userRole === 'DOCTOR') {
    router.navigateByUrl('/DocDash');
  } else if (userRole === 'USER') {
    router.navigateByUrl('/UserDah');
  } else {
    router.navigateByUrl('/connex');
  }

  return false;
};

/**
 * ✅ Guard pour les routes USER uniquement
 */
export const userGuard: CanActivateFn = (route, state) => {
  const jwtService = inject(JwtService);
  const router = inject(Router);

  if (!jwtService.isTokenValid()) {
    router.navigateByUrl("connex");
    return false;
  }

  if (jwtService.isUser()) {
    return true;
  }

  console.warn('🚫 Accès USER uniquement');
  router.navigateByUrl('/DocDash');
  return false;
};

/**
 * ✅ Guard pour les routes DOCTOR uniquement
 */
export const doctorGuard: CanActivateFn = (route, state) => {
  const jwtService = inject(JwtService);
  const router = inject(Router);

  if (!jwtService.isTokenValid()) {
    router.navigateByUrl("connex");
    return false;
  }

  if (jwtService.isDoctor()) {
    return true;
  }

  console.warn('🚫 Accès DOCTOR uniquement');
  router.navigateByUrl('/UserDah');
  return false;
};
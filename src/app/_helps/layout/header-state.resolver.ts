// services/header-state.resolver.ts
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HeaderStateResolver implements Resolve<boolean> {
  
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Récupérer la valeur depuis les données de route
    return route.data['showHeader'] !== false;
  }
}
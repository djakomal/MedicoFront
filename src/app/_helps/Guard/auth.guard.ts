import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { Router } from '@angular/router';
import { JwtService } from '../jwt/jwt.service';


const authGuard: CanActivateFn = (route, state) => {

  const jwtservice = inject(JwtService);
  const router = inject(Router);

  if (jwtservice.isTokenValid()) {
    return true;
  } else {
    router.navigateByUrl("connex");
    return false;
  }
}

export { authGuard };
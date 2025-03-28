import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { LoginService } from '../services/login.service';

export const authGuard = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const loginService = inject(LoginService);
  
  const role = loginService.getRole();

  if (!role) {
    router.navigate(['/login']);
    return false;
  }

  // Prevent "operator" from accessing "user-management"
  if (role === 'operator' && route.routeConfig?.path === 'user-management') {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

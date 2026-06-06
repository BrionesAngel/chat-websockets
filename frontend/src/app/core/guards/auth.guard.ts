import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '@/core/services/auth.service';
import { catchError, map, Observable, of } from 'rxjs';

export const authGuard: CanActivateFn = (_route, state): boolean | UrlTree | Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isTokenValid()) return true;

  return authService.refreshTokens().pipe(
    map(() => true),
    catchError(() => {
      authService.logout();
      return of(router.createUrlTree(['/login'], {
        queryParams: { redirectTo: state.url }
      }));
    })
  );
};

export const guestGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isTokenValid()) {
    return router.createUrlTree(['/dashboard']);
  }
  return true;
};

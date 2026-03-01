import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const adminOnlyGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Development bypass: allow admin routes locally when explicitly enabled.
  if (environment.allowCustomizeWithoutAuth && !environment.production) {
    return true;
  }

  if (authService.isAdmin()) {
    return true;
  }

  try {
    await authService.loginWithGoogle();
    if (authService.isAdmin()) {
      return true;
    }
  } catch {
    // Ignore and redirect below.
  }

  return router.createUrlTree(['/']);
};

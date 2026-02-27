import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const adminOnlyGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthAvailable() && environment.allowCustomizeWithoutAuth) {
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

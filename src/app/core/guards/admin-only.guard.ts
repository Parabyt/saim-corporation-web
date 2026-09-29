import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ContentStoreService } from '../services/content-store.service';
import { AuthService } from '../services/auth.service';
export const adminOnlyGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService); const router = inject(Router); const store = inject(ContentStoreService);
  try { await auth.restore(); if (auth.isAdmin()) { await store.refresh(); if (!store.loadError()) return true; } } catch { /* Login page reports connectivity errors. */ }
  return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
};

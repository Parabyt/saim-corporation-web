import { Routes } from '@angular/router';

import { adminOnlyGuard } from './core/guards/admin-only.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/pages/home-page.component').then((m) => m.HomePageComponent)
  },
  {
    path: 'catalog',
    loadComponent: () => import('./features/catalog/pages/catalog-page.component').then((m) => m.CatalogPageComponent)
  },
  {
    path: 'catalog/all',
    loadComponent: () => import('./features/catalog/pages/all-products-page.component').then((m) => m.AllProductsPageComponent)
  },
  {
    path: 'collections/:slug',
    loadComponent: () => import('./features/catalog/pages/catalog-page.component').then((m) => m.CatalogPageComponent)
  },
  {
    path: 'subcategories/:slug',
    loadComponent: () => import('./features/catalog/pages/catalog-page.component').then((m) => m.CatalogPageComponent)
  },
  {
    path: 'products/:slug',
    loadComponent: () => import('./features/product/pages/product-page.component').then((m) => m.ProductPageComponent)
  },
  {
    path: 'customize',
    canActivate: [adminOnlyGuard],
    loadComponent: () => import('./features/customize/pages/content-editor-page.component').then((m) => m.ContentEditorPageComponent)
  },
  {
    path: 'admin',
    canActivate: [adminOnlyGuard],
    loadComponent: () => import('./features/admin/pages/admin-page.component').then((m) => m.AdminPageComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/pages/about-page.component').then((m) => m.AboutPageComponent)
  },
  {
    path: 'inquiry',
    loadComponent: () => import('./features/inquiry/pages/inquiry-page.component').then((m) => m.InquiryPageComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/pages/contact-page.component').then((m) => m.ContactPageComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

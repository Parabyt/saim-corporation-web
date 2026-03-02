import { InjectionToken } from '@angular/core';

import { Category, Product, Subcategory } from '../models/catalog.models';

export interface AdminCatalogBackendPort {
  upsertCategory(category: Category): Promise<boolean>;
  deleteCategory(id: string): Promise<boolean>;
  upsertSubcategory(subcategory: Subcategory): Promise<boolean>;
  deleteSubcategory(id: string): Promise<boolean>;
  upsertProduct(product: Product): Promise<boolean>;
  deleteProduct(id: string): Promise<boolean>;
  uploadImage(file: File, folder: 'categories' | 'subcategories' | 'products' | 'home'): Promise<string>;
}

export const ADMIN_CATALOG_BACKEND = new InjectionToken<AdminCatalogBackendPort>('ADMIN_CATALOG_BACKEND');

import { Injectable, Injector, inject } from '@angular/core';

import { AdminCatalogBackendPort } from '../ports/admin-catalog-backend.port';
import { Category, Product, Subcategory } from '../models/catalog.models';
import { FirebaseCatalogService } from './firebase-catalog.service';

@Injectable({ providedIn: 'root' })
export class FirebaseAdminCatalogBackendService implements AdminCatalogBackendPort {
  private readonly injector = inject(Injector);

  async upsertCategory(category: Category): Promise<boolean> {
    const firebaseCatalog = this.getFirebaseCatalog();
    if (!firebaseCatalog) {
      return false;
    }

    await firebaseCatalog.upsertCategory(category);
    return true;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const firebaseCatalog = this.getFirebaseCatalog();
    if (!firebaseCatalog) {
      return false;
    }

    await firebaseCatalog.deleteCategory(id);
    return true;
  }

  async upsertSubcategory(subcategory: Subcategory): Promise<boolean> {
    const firebaseCatalog = this.getFirebaseCatalog();
    if (!firebaseCatalog) {
      return false;
    }

    await firebaseCatalog.upsertSubcategory(subcategory);
    return true;
  }

  async deleteSubcategory(id: string): Promise<boolean> {
    const firebaseCatalog = this.getFirebaseCatalog();
    if (!firebaseCatalog) {
      return false;
    }

    await firebaseCatalog.deleteSubcategory(id);
    return true;
  }

  async upsertProduct(product: Product): Promise<boolean> {
    const firebaseCatalog = this.getFirebaseCatalog();
    if (!firebaseCatalog) {
      return false;
    }

    await firebaseCatalog.upsertProduct(product);
    return true;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const firebaseCatalog = this.getFirebaseCatalog();
    if (!firebaseCatalog) {
      return false;
    }

    await firebaseCatalog.deleteProduct(id);
    return true;
  }

  async uploadImage(file: File, folder: 'categories' | 'subcategories' | 'products' | 'home'): Promise<string> {
    const firebaseCatalog = this.getFirebaseCatalog();
    if (!firebaseCatalog) {
      throw new Error('Firebase is not configured yet. Add keys in environment files.');
    }

    return firebaseCatalog.uploadImage(file, folder);
  }

  private getFirebaseCatalog(): FirebaseCatalogService | null {
    try {
      return this.injector.get(FirebaseCatalogService);
    } catch {
      return null;
    }
  }
}

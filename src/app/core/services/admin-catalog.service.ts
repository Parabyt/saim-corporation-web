import { Inject, Injectable, inject } from '@angular/core';

import {
  Category,
  CategoryCreateInput,
  CategoryUpdateInput,
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  Subcategory,
  SubcategoryCreateInput,
  SubcategoryUpdateInput
} from '../models/catalog.models';
import { ADMIN_CATALOG_BACKEND, AdminCatalogBackendPort } from '../ports/admin-catalog-backend.port';
import { ContentStoreService } from './content-store.service';

export interface AdminActionResult {
  persistedTo: 'local' | 'firebase';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AdminCatalogService {
  private readonly contentStore = inject(ContentStoreService);
  constructor(@Inject(ADMIN_CATALOG_BACKEND) private readonly backend: AdminCatalogBackendPort) {}

  readonly categories = this.contentStore.categories;
  readonly subcategories = this.contentStore.subcategories;
  readonly products = this.contentStore.products;

  async createCategory(input: CategoryCreateInput): Promise<AdminActionResult> {
    const created = this.contentStore.createCategory(input);
    return this.syncCategory(created, 'Category created.');
  }

  async updateCategory(id: string, update: CategoryUpdateInput): Promise<AdminActionResult> {
    this.contentStore.updateCategory(id, update);
    const updated = this.contentStore.categories().find((item) => item.id === id);
    if (!updated) {
      return { persistedTo: 'local', message: 'Category updated locally.' };
    }

    return this.syncCategory(updated, 'Category updated.');
  }

  async deleteCategory(id: string): Promise<AdminActionResult> {
    const relatedSubcategories = this.contentStore.subcategories().filter((item) => item.categoryId === id);
    const relatedSubcategoryIds = new Set(relatedSubcategories.map((item) => item.id));
    const relatedProducts = this.contentStore
      .products()
      .filter((item) => item.categoryId === id || (item.subcategoryId ? relatedSubcategoryIds.has(item.subcategoryId) : false));

    this.contentStore.deleteCategory(id);

    try {
      const deleteResults = await Promise.all([
        ...relatedProducts.map((item) => this.backend.deleteProduct(item.id)),
        ...relatedSubcategories.map((item) => this.backend.deleteSubcategory(item.id)),
        this.backend.deleteCategory(id)
      ]);
      if (deleteResults.some((result) => !result)) {
        return { persistedTo: 'local', message: 'Category deleted locally.' };
      }
      return { persistedTo: 'firebase', message: 'Category deleted and synced to Firebase.' };
    } catch {
      return { persistedTo: 'local', message: 'Category deleted locally. Firebase sync failed.' };
    }
  }

  async createSubcategory(input: SubcategoryCreateInput): Promise<AdminActionResult> {
    const created = this.contentStore.createSubcategory(input);
    return this.syncSubcategory(created, 'Subcategory created.');
  }

  async updateSubcategory(id: string, update: SubcategoryUpdateInput): Promise<AdminActionResult> {
    this.contentStore.updateSubcategory(id, update);
    const updated = this.contentStore.subcategories().find((item) => item.id === id);
    if (!updated) {
      return { persistedTo: 'local', message: 'Subcategory updated locally.' };
    }

    return this.syncSubcategory(updated, 'Subcategory updated.');
  }

  async deleteSubcategory(id: string): Promise<AdminActionResult> {
    const relatedProducts = this.contentStore.products().filter((item) => item.subcategoryId === id);
    this.contentStore.deleteSubcategory(id);

    try {
      const deleteResults = await Promise.all([
        ...relatedProducts.map((item) => this.backend.deleteProduct(item.id)),
        this.backend.deleteSubcategory(id)
      ]);
      if (deleteResults.some((result) => !result)) {
        return { persistedTo: 'local', message: 'Subcategory deleted locally.' };
      }
      return { persistedTo: 'firebase', message: 'Subcategory deleted and synced to Firebase.' };
    } catch {
      return { persistedTo: 'local', message: 'Subcategory deleted locally. Firebase sync failed.' };
    }
  }

  async createProduct(input: ProductCreateInput): Promise<AdminActionResult> {
    const created = this.contentStore.createProduct(input);
    return this.syncProduct(created, 'Product created.');
  }

  async updateProduct(id: string, update: ProductUpdateInput): Promise<AdminActionResult> {
    this.contentStore.updateProduct(id, update);
    const updated = this.contentStore.products().find((item) => item.id === id);
    if (!updated) {
      return { persistedTo: 'local', message: 'Product updated locally.' };
    }

    return this.syncProduct(updated, 'Product updated.');
  }

  async deleteProduct(id: string): Promise<AdminActionResult> {
    this.contentStore.deleteProduct(id);

    try {
      const synced = await this.backend.deleteProduct(id);
      if (!synced) {
        return { persistedTo: 'local', message: 'Product deleted locally.' };
      }
      return { persistedTo: 'firebase', message: 'Product deleted and synced to Firebase.' };
    } catch {
      return { persistedTo: 'local', message: 'Product deleted locally. Firebase sync failed.' };
    }
  }

  async uploadImage(file: File, folder: 'categories' | 'subcategories' | 'products' | 'home'): Promise<string> {
    return this.backend.uploadImage(file, folder);
  }

  private async syncCategory(category: Category, successPrefix: string): Promise<AdminActionResult> {
    try {
      const synced = await this.backend.upsertCategory(category);
      if (!synced) {
        return { persistedTo: 'local', message: `${successPrefix} Saved locally.` };
      }
      return { persistedTo: 'firebase', message: `${successPrefix} Synced to Firebase.` };
    } catch {
      return { persistedTo: 'local', message: `${successPrefix} Saved locally. Firebase sync failed.` };
    }
  }

  private async syncSubcategory(subcategory: Subcategory, successPrefix: string): Promise<AdminActionResult> {
    try {
      const synced = await this.backend.upsertSubcategory(subcategory);
      if (!synced) {
        return { persistedTo: 'local', message: `${successPrefix} Saved locally.` };
      }
      return { persistedTo: 'firebase', message: `${successPrefix} Synced to Firebase.` };
    } catch {
      return { persistedTo: 'local', message: `${successPrefix} Saved locally. Firebase sync failed.` };
    }
  }

  private async syncProduct(product: Product, successPrefix: string): Promise<AdminActionResult> {
    try {
      const synced = await this.backend.upsertProduct(product);
      if (!synced) {
        return { persistedTo: 'local', message: `${successPrefix} Saved locally.` };
      }
      return { persistedTo: 'firebase', message: `${successPrefix} Synced to Firebase.` };
    } catch {
      return { persistedTo: 'local', message: `${successPrefix} Saved locally. Firebase sync failed.` };
    }
  }
}

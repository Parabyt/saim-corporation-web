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
import { HomeContent } from '../models/home.models';
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
    const previous = this.contentStore.categories().find((item) => item.id === id);
    this.contentStore.updateCategory(id, update);
    const updated = this.contentStore.categories().find((item) => item.id === id);
    if (!updated) {
      return { persistedTo: 'local', message: 'Category updated locally.' };
    }

    const result = await this.syncCategory(updated, 'Category updated.');
    if (result.persistedTo === 'firebase' && previous && previous.imageUrl !== updated.imageUrl) {
      await this.cleanupImagesIfUnused([previous.imageUrl]);
    }
    return result;
  }

  async deleteCategory(id: string): Promise<AdminActionResult> {
    const category = this.contentStore.categories().find((item) => item.id === id);
    const relatedSubcategories = this.contentStore.subcategories().filter((item) => item.categoryId === id);
    const relatedSubcategoryIds = new Set(relatedSubcategories.map((item) => item.id));
    const relatedProducts = this.contentStore
      .products()
      .filter((item) => item.categoryId === id || (item.subcategoryId ? relatedSubcategoryIds.has(item.subcategoryId) : false));
    const removedImageUrls = [
      category?.imageUrl ?? '',
      ...relatedSubcategories.map((item) => item.imageUrl),
      ...relatedProducts.map((item) => item.imageUrl),
      ...relatedProducts.flatMap((item) => item.gallery ?? [])
    ];

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
      await this.cleanupImagesIfUnused(removedImageUrls);
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
    const previous = this.contentStore.subcategories().find((item) => item.id === id);
    this.contentStore.updateSubcategory(id, update);
    const updated = this.contentStore.subcategories().find((item) => item.id === id);
    if (!updated) {
      return { persistedTo: 'local', message: 'Subcategory updated locally.' };
    }

    const result = await this.syncSubcategory(updated, 'Subcategory updated.');
    if (result.persistedTo === 'firebase' && previous && previous.imageUrl !== updated.imageUrl) {
      await this.cleanupImagesIfUnused([previous.imageUrl]);
    }
    return result;
  }

  async deleteSubcategory(id: string): Promise<AdminActionResult> {
    const subcategory = this.contentStore.subcategories().find((item) => item.id === id);
    const relatedProducts = this.contentStore.products().filter((item) => item.subcategoryId === id);
    const removedImageUrls = [
      subcategory?.imageUrl ?? '',
      ...relatedProducts.map((item) => item.imageUrl),
      ...relatedProducts.flatMap((item) => item.gallery ?? [])
    ];
    this.contentStore.deleteSubcategory(id);

    try {
      const deleteResults = await Promise.all([
        ...relatedProducts.map((item) => this.backend.deleteProduct(item.id)),
        this.backend.deleteSubcategory(id)
      ]);
      if (deleteResults.some((result) => !result)) {
        return { persistedTo: 'local', message: 'Subcategory deleted locally.' };
      }
      await this.cleanupImagesIfUnused(removedImageUrls);
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
    const previous = this.contentStore.products().find((item) => item.id === id);
    this.contentStore.updateProduct(id, update);
    const updated = this.contentStore.products().find((item) => item.id === id);
    if (!updated) {
      return { persistedTo: 'local', message: 'Product updated locally.' };
    }

    const result = await this.syncProduct(updated, 'Product updated.');
    if (result.persistedTo === 'firebase' && previous && previous.imageUrl !== updated.imageUrl) {
      await this.cleanupImagesIfUnused([previous.imageUrl]);
    }
    return result;
  }

  async deleteProduct(id: string): Promise<AdminActionResult> {
    const product = this.contentStore.products().find((item) => item.id === id);
    const removedImageUrls = product ? [product.imageUrl, ...(product.gallery ?? [])] : [];
    this.contentStore.deleteProduct(id);

    try {
      const synced = await this.backend.deleteProduct(id);
      if (!synced) {
        return { persistedTo: 'local', message: 'Product deleted locally.' };
      }
      await this.cleanupImagesIfUnused(removedImageUrls);
      return { persistedTo: 'firebase', message: 'Product deleted and synced to Firebase.' };
    } catch {
      return { persistedTo: 'local', message: 'Product deleted locally. Firebase sync failed.' };
    }
  }

  async uploadImage(file: File, folder: 'categories' | 'subcategories' | 'products' | 'home'): Promise<string> {
    return this.backend.uploadImage(file, folder);
  }

  async updateHeroSlides(slides: HomeContent['heroSlides']): Promise<AdminActionResult> {
    const current = this.contentStore.homeContent();
    const nextSlides = structuredClone(slides);
    const nextById = new Map(nextSlides.map((item) => [item.id, item]));
    const replacedUrls = current.heroSlides
      .filter((slide) => (nextById.get(slide.id)?.imageUrl ?? '') !== slide.imageUrl)
      .map((slide) => slide.imageUrl);

    this.contentStore.updateHomeContent({
      ...current,
      heroSlides: nextSlides
    });

    await this.cleanupImagesIfUnused(replacedUrls);
    return { persistedTo: 'local', message: 'Top slider updated.' };
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

  private async cleanupImagesIfUnused(urls: string[]): Promise<void> {
    const candidates = [...new Set(urls.map((item) => item.trim()).filter((item) => item.length > 0))];
    if (!candidates.length) {
      return;
    }

    for (const imageUrl of candidates) {
      if (!this.isManagedFirebaseUrl(imageUrl)) {
        continue;
      }

      if (this.getReferencedImageUrls().has(imageUrl)) {
        continue;
      }

      try {
        await this.backend.deleteImageByUrl(imageUrl);
      } catch {
        // Best-effort cleanup; primary data operation is already complete.
      }
    }
  }

  private getReferencedImageUrls(): Set<string> {
    const urls = new Set<string>();

    this.contentStore.categories().forEach((item) => this.addIfPresent(urls, item.imageUrl));
    this.contentStore.subcategories().forEach((item) => this.addIfPresent(urls, item.imageUrl));
    this.contentStore.products().forEach((item) => {
      this.addIfPresent(urls, item.imageUrl);
      item.gallery?.forEach((entry) => this.addIfPresent(urls, entry));
    });

    const homeContent = this.contentStore.homeContent();
    homeContent.heroSlides.forEach((slide) => this.addIfPresent(urls, slide.imageUrl));
    homeContent.blocks.forEach((block) => this.addIfPresent(urls, block.imageUrl));

    return urls;
  }

  private addIfPresent(urls: Set<string>, value: string | undefined): void {
    const trimmed = value?.trim();
    if (trimmed) {
      urls.add(trimmed);
    }
  }

  private isManagedFirebaseUrl(url: string): boolean {
    const value = url.toLowerCase();
    return value.includes('firebasestorage.googleapis.com') || value.includes('.firebasestorage.app');
  }
}

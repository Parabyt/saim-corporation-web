import { Injectable, inject } from '@angular/core';
import { CategoryCreateInput, CategoryUpdateInput, ProductCreateInput, ProductUpdateInput, SubcategoryCreateInput, SubcategoryUpdateInput } from '../models/catalog.models';
import { HomeContent } from '../models/home.models';
import { CompanyProfile } from '../models/company-profile.models';
import { CONTENT_REPOSITORY, MEDIA_REPOSITORY, ContentSnapshot, MediaFolder } from '../ports/backend.port';
import { ContentStoreService } from './content-store.service';
export interface AdminActionResult { persistedTo: 'server'; message: string; }
@Injectable({ providedIn: 'root' })
export class AdminCatalogService {
  private readonly store = inject(ContentStoreService);
  private readonly repository = inject(CONTENT_REPOSITORY);
  private readonly media = inject(MEDIA_REPOSITORY);
  readonly categories = this.store.categories;
  readonly subcategories = this.store.subcategories;
  readonly products = this.store.products;
  createCategory(value: CategoryCreateInput): Promise<AdminActionResult> {
    return this.commit(this.repository.save('categories', { ...value, id: crypto.randomUUID(), slug: this.slug(value.title) }));
  }
  updateCategory(id: string, value: CategoryUpdateInput): Promise<AdminActionResult> {
    const previous = this.categories().find(v => v.id === id); if (!previous) throw new Error('Category not found.');
    return this.commit(this.repository.save('categories', { ...previous, ...value, slug: this.slug(value.title ?? previous.title) }));
  }
  deleteCategory(id: string): Promise<AdminActionResult> { return this.commit(this.repository.remove('categories', id)); }
  createSubcategory(value: SubcategoryCreateInput): Promise<AdminActionResult> {
    return this.commit(this.repository.save('subcategories', { ...value, id: crypto.randomUUID(), slug: this.slug(value.title) }));
  }
  updateSubcategory(id: string, value: SubcategoryUpdateInput): Promise<AdminActionResult> {
    const previous = this.subcategories().find(v => v.id === id); if (!previous) throw new Error('Subcategory not found.');
    return this.commit(this.repository.save('subcategories', { ...previous, ...value, slug: this.slug(value.title ?? previous.title) }));
  }
  deleteSubcategory(id: string): Promise<AdminActionResult> { return this.commit(this.repository.remove('subcategories', id)); }
  createProduct(value: ProductCreateInput): Promise<AdminActionResult> {
    return this.commit(this.repository.save('products', { ...value, id: crypto.randomUUID(), slug: this.slug(value.title), gallery: [value.imageUrl], currency: 'USD' }));
  }
  updateProduct(id: string, value: ProductUpdateInput): Promise<AdminActionResult> {
    const previous = this.products().find(v => v.id === id); if (!previous) throw new Error('Product not found.');
    const imageUrl = value.imageUrl ?? previous.imageUrl;
    const gallery = value.gallery ?? previous.gallery.map(url => url === previous.imageUrl ? imageUrl : url);
    return this.commit(this.repository.save('products', { ...previous, ...value, imageUrl, gallery, slug: this.slug(value.title ?? previous.title) }));
  }
  deleteProduct(id: string): Promise<AdminActionResult> { return this.commit(this.repository.remove('products', id)); }
  uploadImage(file: File, folder: MediaFolder): Promise<string> { return this.media.upload(file, folder); }
  updateHeroSlides(heroSlides: HomeContent['heroSlides']): Promise<AdminActionResult> { return this.saveHome({ ...this.store.homeContent(), heroSlides }); }
  saveHome(home: HomeContent): Promise<AdminActionResult> { return this.commit(this.repository.saveHome(home)); }
  saveCompany(company: CompanyProfile): Promise<AdminActionResult> { return this.commit(this.repository.saveCompany(company)); }
  importCatalog(value: Pick<ContentSnapshot, 'categories' | 'subcategories' | 'products'>): Promise<AdminActionResult> { return this.commit(this.repository.importCatalog(value)); }
  private async commit(request: Promise<ContentSnapshot>): Promise<AdminActionResult> {
    this.store.accept(await request);
    return { persistedTo: 'server', message: 'Changes saved.' };
  }
  private slug(value: string): string { return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'); }
}

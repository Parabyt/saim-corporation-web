import { Injectable, computed, inject, signal } from '@angular/core';
import { Category, Product, Subcategory } from '../models/catalog.models';
import { CONTENT_REPOSITORY, ContentSnapshot } from '../ports/backend.port';
import { DEFAULT_HOME_CONTENT, DEFAULT_COMPANY_PROFILE } from '../data/default-content';
import { NICHE_CATEGORIES, NICHE_PRODUCT_SEEDS, NICHE_SUBCATEGORY_SEEDS } from '../data/niche-catalog.data';
@Injectable({ providedIn: 'root' })
export class ContentStoreService {
  private readonly repository = inject(CONTENT_REPOSITORY);
  private readonly state = signal<ContentSnapshot>(this.fallback());
  readonly loadError = signal('');
  readonly categories = computed(() => this.state().categories);
  readonly subcategories = computed(() => this.state().subcategories);
  readonly products = computed(() => this.state().products);
  readonly homeContent = computed(() => this.state().home);
  readonly companyProfile = computed(() => this.state().company);
  async refresh(): Promise<void> {
    try { this.accept(await this.repository.load()); this.loadError.set(''); }
    catch (error) { this.loadError.set(error instanceof Error ? error.message : 'Content unavailable.'); }
  }
  // Only called with a committed server response; empty arrays must remain empty.
  accept(value: ContentSnapshot): void {
    this.state.set(value);
    try { localStorage.setItem('saim.api.snapshot', JSON.stringify(value)); } catch { /* Cache is optional. */ }
  }
  getCategoryBySlug(slug: string): Category | undefined { return this.categories().find(item => item.slug === slug); }
  getSubcategoryBySlug(slug: string): Subcategory | undefined { return this.subcategories().find(item => item.slug === slug); }
  getProductBySlug(slug: string): Product | undefined { return this.products().find(item => item.slug === slug); }
  private read<T>(key: string): T | null {
    try { return JSON.parse(localStorage.getItem(key) || 'null') as T | null; } catch { return null; }
  }
  private fallback(): ContentSnapshot {
    const cached = this.read<ContentSnapshot>('saim.api.snapshot');
    if (cached) return cached;
    const categories = this.read<Category[]>('saim.categories') ?? NICHE_CATEGORIES.map((v, i) => ({ ...v, id: `cat-seed-${i + 1}` }));
    const subcategories = this.read<Subcategory[]>('saim.subcategories') ?? NICHE_SUBCATEGORY_SEEDS.map((v, i) => ({
      id: `sub-seed-${i + 1}`, slug: v.slug, title: v.title, description: v.description, imageUrl: v.imageUrl,
      categoryId: categories.find(c => c.slug === v.categorySlug)?.id || ''
    })).filter(v => v.categoryId);
    const products = this.read<Product[]>('saim.products') ?? NICHE_PRODUCT_SEEDS.map((v, i) => {
      const categoryId = categories.find(c => c.slug === v.categorySlug)?.id || '';
      return { id: `prd-seed-${i + 1}`, slug: v.title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'),
        title: v.title, description: v.description, imageUrl: v.imageUrl, gallery: [v.imageUrl], categoryId,
        subcategoryId: subcategories.find(s => s.categoryId === categoryId && s.slug === v.subcategorySlug)?.id,
        price: v.price, originCountry: v.originCountry, currency: 'USD' };
    }).filter(v => v.categoryId);
    return { categories, subcategories, products,
      home: this.read('saim.homeContent') ?? DEFAULT_HOME_CONTENT,
      company: this.read('saim.companyProfile') ?? DEFAULT_COMPANY_PROFILE };
  }
}

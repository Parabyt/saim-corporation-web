import { Injectable, computed, signal } from '@angular/core';

import { NICHE_CATEGORIES, NICHE_PRODUCT_SEEDS, NICHE_SUBCATEGORY_SEEDS } from '../data/niche-catalog.data';
import { Category, Product, Subcategory } from '../models/catalog.models';
import { HomeContent } from '../models/home.models';

const CATALOG_SEED_VERSION = 'niche-v3-2026-02-24';

const STORAGE_KEYS = {
  catalogVersion: 'saim.catalogVersion',
  categories: 'saim.categories',
  subcategories: 'saim.subcategories',
  products: 'saim.products',
  home: 'saim.homeContent'
};

const LEGACY_NEWSLETTER_TITLE = 'Stay Updated with New Fabric Drops';
const LEGACY_NEWSLETTER_TEXT = 'Get new category launches, stock alerts, and wholesale offers directly in your inbox.';

const DEFAULT_HOME_CONTENT: HomeContent = {
  heroSlides: [
    {
      id: 'hero-1',
      title: 'Leather Jackets, Belts, And Bags For Export',
      subtitle: 'Premium stitched leather collections for international distributors and private labels.',
      imageUrl: 'https://images.unsplash.com/photo-1551048632-948310cee98b?auto=format&fit=crop&w=1800&q=80',
      tags: ['#LeatherJackets', '#LeatherBelts', '#LeatherBags', '#GlobalExport']
    },
    {
      id: 'hero-2',
      title: 'Team Sports Uniforms And Football Gear',
      subtitle: 'Wholesale sports uniforms and match-day apparel tailored for clubs and academies.',
      imageUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1800&q=80',
      tags: ['#SportsUniform', '#FootballWear', '#TeamKits', '#BulkSupply']
    },
    {
      id: 'hero-3',
      title: 'Gym Wear And Boxing Equipment Range',
      subtitle: 'Training apparel, boxing gloves, and lifting belts built for performance markets.',
      imageUrl: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=1800&q=80',
      tags: ['#GymWear', '#BoxingGloves', '#GymBelts', '#FitnessExport']
    },
    {
      id: 'hero-4',
      title: 'Industrial And Service Uniform Programs',
      subtitle: 'Durable uniform sets for manufacturing, hospitality, and service teams.',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1800&q=80',
      tags: ['#Uniforms', '#WorkUniform', '#InstitutionalSupply', '#CustomOrders']
    },
    {
      id: 'hero-5',
      title: 'Performance Sports Apparel For Global Buyers',
      subtitle: 'Breathable, moisture-managed sportswear for retail and teamwear segments.',
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1800&q=80',
      tags: ['#SportsWear', '#PerformanceFabric', '#Wholesale', '#GlobalTrade']
    },
    {
      id: 'hero-6',
      title: 'Private Label Leather And Activewear Manufacturing',
      subtitle: 'End-to-end OEM support for export-ready apparel and accessory product lines.',
      imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1800&q=80',
      tags: ['#PrivateLabel', '#LeatherGoods', '#Activewear', '#OEMExport']
    }
  ],
  marqueeText: 'FAST DELIVERY • HIGH STOCK AVAILABILITY • EXPORT QUALITY • CUSTOM ORDERS • WHOLESALE READY •',
  newsletterTitle: 'Share Your Sourcing Brief',
  newsletterText:
    'Tell us your product specs, target market, and quantity goals. We will map the right manufacturing route, quality plan, and shipping mode for your import program.',
  blocks: [
    {
      id: 'blk-1',
      title: 'Export Ready Stock',
      subtitle: 'High-volume lots prepared for global dispatch.',
      imageUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1000&q=80',
      link: '/catalog'
    },
    {
      id: 'blk-2',
      title: 'Trend Driven Patterns',
      subtitle: 'Fast-moving collections for seasonal demand.',
      imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=80',
      link: '/catalog'
    },
    {
      id: 'blk-3',
      title: 'Wholesale Pricing',
      subtitle: 'Optimized sourcing for repeat B2B orders.',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80',
      link: '/catalog'
    }
  ]
};

@Injectable({ providedIn: 'root' })
export class ContentStoreService {
  private readonly forceCatalogReseed = localStorage.getItem(STORAGE_KEYS.catalogVersion) !== CATALOG_SEED_VERSION;
  private readonly categoriesState = signal<Category[]>(this.loadCategories());
  private readonly subcategoriesState = signal<Subcategory[]>(this.loadSubcategories());
  private readonly productsState = signal<Product[]>(this.loadProducts());
  private readonly homeContentState = signal<HomeContent>(this.loadHomeContent());

  readonly categories = computed(() => this.categoriesState());
  readonly subcategories = computed(() => this.subcategoriesState());
  readonly products = computed(() => this.productsState());
  readonly homeContent = computed(() => this.homeContentState());

  constructor() {
    localStorage.setItem(STORAGE_KEYS.catalogVersion, CATALOG_SEED_VERSION);
  }

  addCategory(category: Omit<Category, 'id' | 'slug'>): void {
    this.categoriesState.update((existing) => [
      ...existing,
      { ...category, id: this.newId('cat'), slug: this.slugify(category.title) }
    ]);
    this.persistCategories();
  }

  addSubcategory(subcategory: Omit<Subcategory, 'id' | 'slug'>): void {
    this.subcategoriesState.update((existing) => [
      ...existing,
      { ...subcategory, id: this.newId('sub'), slug: this.slugify(subcategory.title) }
    ]);
    this.persistSubcategories();
  }

  addProduct(product: Omit<Product, 'id' | 'slug' | 'gallery' | 'currency'>): void {
    this.productsState.update((existing) => [
      ...existing,
      {
        ...product,
        id: this.newId('prd'),
        slug: this.slugify(product.title),
        gallery: [product.imageUrl],
        currency: 'USD'
      }
    ]);
    this.persistProducts();
  }

  replaceCatalog(categories: Category[], products: Product[]): void {
    this.categoriesState.set(categories);
    this.productsState.set(products);
    this.subcategoriesState.set([]);
    this.persistCategories();
    this.persistProducts();
    this.persistSubcategories();
  }

  updateHomeContent(content: HomeContent): void {
    this.homeContentState.set(content);
    localStorage.setItem(STORAGE_KEYS.home, JSON.stringify(content));
  }

  getCategoryBySlug(slug: string): Category | undefined {
    return this.categoriesState().find((item) => item.slug === slug);
  }

  getSubcategoryBySlug(slug: string): Subcategory | undefined {
    return this.subcategoriesState().find((item) => item.slug === slug);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.productsState().find((item) => item.slug === slug);
  }

  private loadCategories(): Category[] {
    if (this.forceCatalogReseed) {
      const seeded = NICHE_CATEGORIES.map((category, index) => ({ ...category, id: `cat-seed-${index + 1}` }));
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(seeded));
      return seeded;
    }

    const saved = this.tryLoad<Category[]>(STORAGE_KEYS.categories);
    if (saved?.length) {
      return saved;
    }

    const seeded = NICHE_CATEGORIES.map((category, index) => ({ ...category, id: `cat-seed-${index + 1}` }));
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(seeded));
    return seeded;
  }

  private loadSubcategories(): Subcategory[] {
    if (this.forceCatalogReseed) {
      const categoryIdBySlug = new Map(this.categoriesState().map((category) => [category.slug, category.id]));
      const fallback = NICHE_SUBCATEGORY_SEEDS.map((seed, index) => ({
        id: `sub-seed-${index + 1}`,
        slug: seed.slug,
        categoryId: categoryIdBySlug.get(seed.categorySlug) ?? '',
        title: seed.title,
        imageUrl: seed.imageUrl,
        description: seed.description
      })).filter((subcategory) => subcategory.categoryId);

      localStorage.setItem(STORAGE_KEYS.subcategories, JSON.stringify(fallback));
      return fallback;
    }

    const saved = this.tryLoad<Subcategory[]>(STORAGE_KEYS.subcategories);
    if (saved?.length) {
      return saved;
    }

    const categoryIdBySlug = new Map(this.categoriesState().map((category) => [category.slug, category.id]));
    const fallback: Subcategory[] = NICHE_SUBCATEGORY_SEEDS.map((seed, index) => ({
      id: `sub-seed-${index + 1}`,
      slug: seed.slug,
      categoryId: categoryIdBySlug.get(seed.categorySlug) ?? '',
      title: seed.title,
      imageUrl: seed.imageUrl,
      description: seed.description
    })).filter((subcategory) => subcategory.categoryId);

    localStorage.setItem(STORAGE_KEYS.subcategories, JSON.stringify(fallback));
    return fallback;
  }

  private loadProducts(): Product[] {
    if (this.forceCatalogReseed) {
      const categoryIdBySlug = new Map(this.categoriesState().map((category) => [category.slug, category.id]));
      const subcategoryIdByKey = new Map(
        this.subcategoriesState().map((subcategory) => [`${subcategory.categoryId}:${subcategory.slug}`, subcategory.id])
      );

      const fallback = NICHE_PRODUCT_SEEDS.map((seed, index) => {
        const categoryId = categoryIdBySlug.get(seed.categorySlug) ?? '';
        const subcategoryId = subcategoryIdByKey.get(`${categoryId}:${seed.subcategorySlug}`);
        return {
          id: `prd-seed-${index + 1}`,
          slug: this.slugify(seed.title),
          categoryId,
          subcategoryId,
          title: seed.title,
          imageUrl: seed.imageUrl,
          gallery: [seed.imageUrl],
          description: seed.description,
          originCountry: seed.originCountry,
          price: seed.price,
          currency: 'USD'
        };
      }).filter((product) => product.categoryId) as Product[];

      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(fallback));
      return fallback;
    }

    const saved = this.tryLoad<Product[]>(STORAGE_KEYS.products);
    if (saved?.length) {
      return saved;
    }

    const categoryIdBySlug = new Map(this.categoriesState().map((category) => [category.slug, category.id]));
    const subcategoryIdByKey = new Map(
      this.subcategoriesState().map((subcategory) => [`${subcategory.categoryId}:${subcategory.slug}`, subcategory.id])
    );

    const fallback: Product[] = NICHE_PRODUCT_SEEDS.map((seed, index) => {
      const categoryId = categoryIdBySlug.get(seed.categorySlug) ?? '';
      const subcategoryId = subcategoryIdByKey.get(`${categoryId}:${seed.subcategorySlug}`);
      return {
        id: `prd-seed-${index + 1}`,
        slug: this.slugify(seed.title),
        categoryId,
        subcategoryId,
        title: seed.title,
        imageUrl: seed.imageUrl,
        gallery: [seed.imageUrl],
        description: seed.description,
        originCountry: seed.originCountry,
        price: seed.price,
        currency: 'USD'
      };
    }).filter((product) => product.categoryId) as Product[];

    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(fallback));
    return fallback;
  }

  private loadHomeContent(): HomeContent {
    const saved = this.tryLoad<HomeContent>(STORAGE_KEYS.home);
    if (!saved) {
      return DEFAULT_HOME_CONTENT;
    }

    return this.normalizeHomeContent(saved);
  }

  private normalizeHomeContent(content: HomeContent): HomeContent {
    const normalizedSlides = Array.isArray(content.heroSlides) ? content.heroSlides : [];
    const newsletterTitle = this.migrateLegacyHomeText(content.newsletterTitle, LEGACY_NEWSLETTER_TITLE);
    const newsletterText = this.migrateLegacyHomeText(content.newsletterText, LEGACY_NEWSLETTER_TEXT);

    return {
      ...DEFAULT_HOME_CONTENT,
      ...content,
      newsletterTitle,
      newsletterText,
      heroSlides:
        normalizedSlides.length > 0
          ? normalizedSlides.map((slide, index) => ({
              id: slide.id || `hero-${index + 1}`,
              title: slide.title || DEFAULT_HOME_CONTENT.heroSlides[index % DEFAULT_HOME_CONTENT.heroSlides.length].title,
              subtitle:
                slide.subtitle || DEFAULT_HOME_CONTENT.heroSlides[index % DEFAULT_HOME_CONTENT.heroSlides.length].subtitle,
              imageUrl:
                slide.imageUrl || DEFAULT_HOME_CONTENT.heroSlides[index % DEFAULT_HOME_CONTENT.heroSlides.length].imageUrl,
              tags: Array.isArray(slide.tags) && slide.tags.length > 0 ? slide.tags : ['#Export', '#B2B']
            }))
          : structuredClone(DEFAULT_HOME_CONTENT.heroSlides)
    };
  }

  private migrateLegacyHomeText(value: string | undefined, legacyValue: string): string {
    const safeValue = value?.trim();
    if (!safeValue || safeValue.toLowerCase() === legacyValue.toLowerCase()) {
      return legacyValue === LEGACY_NEWSLETTER_TITLE
        ? DEFAULT_HOME_CONTENT.newsletterTitle
        : DEFAULT_HOME_CONTENT.newsletterText;
    }

    return safeValue;
  }

  private persistCategories(): void {
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(this.categoriesState()));
  }

  private persistSubcategories(): void {
    localStorage.setItem(STORAGE_KEYS.subcategories, JSON.stringify(this.subcategoriesState()));
  }

  private persistProducts(): void {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(this.productsState()));
  }

  private newId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private tryLoad<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
}

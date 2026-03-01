import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HomeContent } from '../../../core/models/home.models';
import { Category, Product } from '../../../core/models/catalog.models';
import { DEFAULT_APP_CONFIG } from '../../../core/config/app.config.model';
import { ContentStoreService } from '../../../core/services/content-store.service';
import { FirebaseCatalogService } from '../../../core/services/firebase-catalog.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-content-editor-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './content-editor-page.component.html',
  styleUrl: './content-editor-page.component.scss'
})
export class ContentEditorPageComponent {
  private readonly contentStore = inject(ContentStoreService);
  private readonly firebaseCatalog = inject(FirebaseCatalogService, { optional: true });
  private readonly themeService = inject(ThemeService);

  readonly categories = this.contentStore.categories;
  readonly statusMessage = signal<string>('');
  readonly activeTab = signal<'catalog' | 'home' | 'theme'>('catalog');

  readonly categoryForm = {
    title: '',
    imageUrl: '',
    description: ''
  };

  readonly subcategoryForm = {
    categoryId: '',
    title: '',
    imageUrl: '',
    description: ''
  };

  readonly productForm = {
    categoryId: '',
    subcategoryId: '',
    title: '',
    imageUrl: '',
    description: '',
    originCountry: '',
    price: 0
  };

  readonly homeForm = signal<HomeContent>(structuredClone(this.contentStore.homeContent()));

  readonly themeForm = {
    primary: DEFAULT_APP_CONFIG.theme.colors.primary,
    primaryDark: DEFAULT_APP_CONFIG.theme.colors.primaryDark,
    accent: DEFAULT_APP_CONFIG.theme.colors.accent,
    surface: DEFAULT_APP_CONFIG.theme.colors.surface,
    mutedText: DEFAULT_APP_CONFIG.theme.colors.mutedText,
    headingText: DEFAULT_APP_CONFIG.theme.colors.headingText,
    border: DEFAULT_APP_CONFIG.theme.colors.border,
    radius: DEFAULT_APP_CONFIG.theme.radius
  };

  readonly hasSubcategoryOptions = computed(() => this.contentStore.subcategories().length > 0);

  setTab(tab: 'catalog' | 'home' | 'theme'): void {
    this.activeTab.set(tab);
  }

  setHomeField(field: 'marqueeText' | 'newsletterTitle' | 'newsletterText', value: string): void {
    this.homeForm.update((current) => ({ ...current, [field]: value }));
  }

  async loadKumasSeed(): Promise<void> {
    try {
      const response = await fetch('/assets/seeds/kumas-seed.json');
      if (!response.ok) {
        throw new Error('Seed file missing');
      }

      const data = (await response.json()) as { categories: Category[]; products: Product[] };
      this.contentStore.replaceCatalog(data.categories, data.products);
      this.statusMessage.set(`Loaded ${data.categories.length} categories and ${data.products.length} products from Kumas seed.`);
    } catch {
      this.statusMessage.set('Failed to load Kumas seed. Run npm run import:kumas first.');
    }
  }

  addCategory(): void {
    this.contentStore.addCategory(this.categoryForm);
    const created = this.contentStore.categories().at(-1);
    if (created && this.firebaseCatalog) {
      this.firebaseCatalog
        .addCategory({
          slug: created.slug,
          title: created.title,
          imageUrl: created.imageUrl,
          description: created.description
        })
        .then(() => this.statusMessage.set('Category added and synced to Firebase.'))
        .catch(() => this.statusMessage.set('Category added locally. Firebase sync failed.'));
    } else {
      this.statusMessage.set('Category added locally.');
    }
    this.resetCategoryForm();
  }

  addSubcategory(): void {
    this.contentStore.addSubcategory(this.subcategoryForm);
    const created = this.contentStore.subcategories().at(-1);
    if (created && this.firebaseCatalog) {
      this.firebaseCatalog
        .addSubcategory({
          slug: created.slug,
          categoryId: created.categoryId,
          title: created.title,
          imageUrl: created.imageUrl,
          description: created.description
        })
        .then(() => this.statusMessage.set('Subcategory added and synced to Firebase.'))
        .catch(() => this.statusMessage.set('Subcategory added locally. Firebase sync failed.'));
    } else {
      this.statusMessage.set('Subcategory added locally.');
    }
    this.resetSubcategoryForm();
  }

  addProduct(): void {
    this.contentStore.addProduct(this.productForm);
    const created = this.contentStore.products().at(-1);
    if (created && this.firebaseCatalog) {
      this.firebaseCatalog
        .addProduct({
          slug: created.slug,
          categoryId: created.categoryId,
          subcategoryId: created.subcategoryId,
          title: created.title,
          imageUrl: created.imageUrl,
          gallery: created.gallery,
          description: created.description,
          originCountry: created.originCountry,
          price: created.price,
          currency: created.currency
        })
        .then(() => this.statusMessage.set('Product added and synced to Firebase.'))
        .catch(() => this.statusMessage.set('Product added locally. Firebase sync failed.'));
    } else {
      this.statusMessage.set('Product added locally.');
    }
    this.resetProductForm();
  }

  saveHomeContent(): void {
    this.contentStore.updateHomeContent(this.homeForm());
    this.statusMessage.set('Homepage content updated.');
  }

  applyTheme(): void {
    this.themeService.setTheme({
      name: 'Custom Theme',
      colors: {
        primary: this.themeForm.primary,
        primaryDark: this.themeForm.primaryDark,
        accent: this.themeForm.accent,
        surface: this.themeForm.surface,
        mutedText: this.themeForm.mutedText,
        headingText: this.themeForm.headingText,
        border: this.themeForm.border
      },
      radius: this.themeForm.radius
    });

    this.statusMessage.set('Theme applied to current session.');
  }

  updateHomeBlock(index: number, field: 'title' | 'subtitle' | 'imageUrl', value: string): void {
    this.homeForm.update((existing) => {
      const next = structuredClone(existing);
      next.blocks[index][field] = value;
      return next;
    });
  }

  updateHeroSlide(index: number, field: 'title' | 'subtitle' | 'imageUrl', value: string): void {
    this.homeForm.update((existing) => {
      const next = structuredClone(existing);
      next.heroSlides[index][field] = value;
      return next;
    });
  }

  updateHeroSlideTags(index: number, value: string): void {
    this.homeForm.update((existing) => {
      const next = structuredClone(existing);
      next.heroSlides[index].tags = value
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      return next;
    });
  }

  async uploadAndBindImage(
    event: Event,
    type: 'category' | 'subcategory' | 'product' | 'home-slide' | 'home-block',
    blockIndex?: number
  ): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    if (!file) {
      return;
    }

    if (!this.firebaseCatalog) {
      this.statusMessage.set('Firebase is not configured yet. Add keys in environment files.');
      return;
    }

    try {
      const folder = type === 'category' ? 'categories' : type === 'subcategory' ? 'subcategories' : 'products';
      const imageUrl = await this.firebaseCatalog.uploadImage(file, folder);

      if (type === 'category') {
        this.categoryForm.imageUrl = imageUrl;
      }
      if (type === 'subcategory') {
        this.subcategoryForm.imageUrl = imageUrl;
      }
      if (type === 'product') {
        this.productForm.imageUrl = imageUrl;
      }
      if (type === 'home-slide' && blockIndex !== undefined) {
        this.updateHeroSlide(blockIndex, 'imageUrl', imageUrl);
      }
      if (type === 'home-block' && blockIndex !== undefined) {
        this.updateHomeBlock(blockIndex, 'imageUrl', imageUrl);
      }

      this.statusMessage.set('Image uploaded to Firebase Storage.');
    } catch (error) {
      this.statusMessage.set(error instanceof Error ? error.message : 'Image upload failed. Add Firebase config in environment files.');
    }
  }

  private resetCategoryForm(): void {
    this.categoryForm.title = '';
    this.categoryForm.imageUrl = '';
    this.categoryForm.description = '';
  }

  private resetSubcategoryForm(): void {
    this.subcategoryForm.categoryId = '';
    this.subcategoryForm.title = '';
    this.subcategoryForm.imageUrl = '';
    this.subcategoryForm.description = '';
  }

  private resetProductForm(): void {
    this.productForm.categoryId = '';
    this.productForm.subcategoryId = '';
    this.productForm.title = '';
    this.productForm.imageUrl = '';
    this.productForm.description = '';
    this.productForm.originCountry = '';
    this.productForm.price = 0;
  }
}

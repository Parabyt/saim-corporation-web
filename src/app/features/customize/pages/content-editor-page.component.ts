import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HomeContent } from '../../../core/models/home.models';
import { Category, Product } from '../../../core/models/catalog.models';
import { DEFAULT_APP_CONFIG } from '../../../core/config/app.config.model';
import { ContentStoreService } from '../../../core/services/content-store.service';
import { AdminCatalogService } from '../../../core/services/admin-catalog.service';
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
  private readonly adminCatalog = inject(AdminCatalogService);
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
      await this.adminCatalog.importCatalog({ categories: data.categories, subcategories: [], products: data.products });
      this.statusMessage.set(`Loaded ${data.categories.length} categories and ${data.products.length} products from Kumas seed.`);
    } catch (error) {
      this.statusMessage.set(error instanceof Error ? error.message : 'Seed import failed.');
    }
  }

  async addCategory(): Promise<void> {
    try { await this.adminCatalog.createCategory(this.categoryForm); this.resetCategoryForm(); this.statusMessage.set('Category saved.'); }
    catch (error) { this.showError(error); }
  }
  async addSubcategory(): Promise<void> {
    try { await this.adminCatalog.createSubcategory(this.subcategoryForm); this.resetSubcategoryForm(); this.statusMessage.set('Subcategory saved.'); }
    catch (error) { this.showError(error); }
  }
  async addProduct(): Promise<void> {
    try { await this.adminCatalog.createProduct(this.productForm); this.resetProductForm(); this.statusMessage.set('Product saved.'); }
    catch (error) { this.showError(error); }
  }
  async saveHomeContent(): Promise<void> {
    try { await this.adminCatalog.saveHome(this.homeForm()); this.statusMessage.set('Homepage saved.'); }
    catch (error) { this.showError(error); }
  }
  private showError(error: unknown): void { this.statusMessage.set(error instanceof Error ? error.message : 'Save failed.'); }

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


    try {
      const folder = type === 'category' ? 'categories' : type === 'subcategory' ? 'subcategories' : type.startsWith('home-') ? 'home' : 'products';
      const imageUrl = await this.adminCatalog.uploadImage(file, folder);

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

      this.statusMessage.set('Image uploaded. Save the form to apply it.');
    } catch (error) {
      this.statusMessage.set(error instanceof Error ? error.message : 'Image upload failed.');
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

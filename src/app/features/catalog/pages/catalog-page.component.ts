import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';

import { ContentStoreService } from '../../../core/services/content-store.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [ProductCardComponent, RouterLink],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss'
})
export class CatalogPageComponent {
  private readonly contentStore = inject(ContentStoreService);
  private readonly route = inject(ActivatedRoute);

  readonly selectedCategory = signal<string | null>(null);
  readonly selectedSubcategory = signal<string | null>(null);
  readonly finiteCatalogLimit = 12;
  readonly categories = this.contentStore.categories;

  readonly subcategories = computed(() => {
    const selected = this.selectedCategory();
    return this.contentStore.subcategories().filter((item) => !selected || item.categoryId === selected);
  });

  readonly selectedSubcategoryTitle = computed(() => {
    const subcategoryId = this.selectedSubcategory();
    if (!subcategoryId) {
      return null;
    }

    return this.contentStore.subcategories().find((item) => item.id === subcategoryId)?.title ?? null;
  });

  readonly products = computed(() => {
    const categoryId = this.selectedCategory();
    const subcategoryId = this.selectedSubcategory();
    return this.contentStore
      .products()
      .filter((item) => (!categoryId || item.categoryId === categoryId) && (!subcategoryId || item.subcategoryId === subcategoryId));
  });

  readonly finiteProducts = computed(() => this.products().slice(0, this.finiteCatalogLimit));
  readonly hasMoreProducts = computed(() => this.products().length > this.finiteCatalogLimit);

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      const routePath = this.route.snapshot.routeConfig?.path ?? '';

      if (!slug || routePath === 'catalog') {
        this.selectedCategory.set(null);
        this.selectedSubcategory.set(null);
        return;
      }

      if (routePath === 'subcategories/:slug') {
        const subcategory = this.contentStore.getSubcategoryBySlug(slug);
        this.selectedSubcategory.set(subcategory?.id ?? null);
        this.selectedCategory.set(subcategory?.categoryId ?? null);
        return;
      }

      const category = this.contentStore.getCategoryBySlug(slug);
      this.selectedCategory.set(category?.id ?? null);
      this.selectedSubcategory.set(null);
    });
  }

  setCategoryFilter(categoryId: string | null): void {
    const currentlySelected = this.selectedCategory();
    const nextCategory = currentlySelected === categoryId ? null : categoryId;
    this.selectedCategory.set(nextCategory);
    this.selectedSubcategory.set(null);
  }

  setSubcategoryFilter(subcategoryId: string | null): void {
    this.selectedSubcategory.set(subcategoryId);
  }

  viewAllQueryParams(): Record<string, string> {
    const params: Record<string, string> = {};
    const categoryId = this.selectedCategory();
    const subcategoryId = this.selectedSubcategory();

    if (categoryId) {
      params['category'] = categoryId;
    }
    if (subcategoryId) {
      params['subcategory'] = subcategoryId;
    }

    return params;
  }
}

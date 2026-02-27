import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ContentStoreService } from '../../../core/services/content-store.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-all-products-page',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './all-products-page.component.html',
  styleUrl: './all-products-page.component.scss'
})
export class AllProductsPageComponent {
  private readonly contentStore = inject(ContentStoreService);
  private readonly route = inject(ActivatedRoute);

  readonly selectedCategory = signal<string | null>(null);
  readonly selectedSubcategory = signal<string | null>(null);
  readonly searchDraft = signal('');
  readonly appliedSearch = signal('');

  readonly selectedCategoryMeta = computed(() => {
    const categoryId = this.selectedCategory();
    if (!categoryId) {
      return null;
    }
    return this.contentStore.categories().find((item) => item.id === categoryId) ?? null;
  });

  readonly subcategories = computed(() => {
    const categoryId = this.selectedCategory();
    return this.contentStore.subcategories().filter((item) => !categoryId || item.categoryId === categoryId);
  });

  readonly products = computed(() => {
    const categoryId = this.selectedCategory();
    const subcategoryId = this.selectedSubcategory();
    const search = this.appliedSearch().trim().toLowerCase();

    return this.contentStore.products().filter((item) => {
      const categoryMatch = !categoryId || item.categoryId === categoryId;
      const subcategoryMatch = !subcategoryId || item.subcategoryId === subcategoryId;
      const searchMatch =
        !search ||
        item.title.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        item.slug.toLowerCase().includes(search);

      return categoryMatch && subcategoryMatch && searchMatch;
    });
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const category = params.get('category');
      const subcategory = params.get('subcategory');
      this.selectedCategory.set(category);
      this.selectedSubcategory.set(subcategory);
      this.searchDraft.set('');
      this.appliedSearch.set('');
    });
  }

  applySearch(): void {
    this.appliedSearch.set(this.searchDraft().trim());
  }

  clearSearch(): void {
    this.searchDraft.set('');
    this.appliedSearch.set('');
  }

  setSubcategoryFilter(subcategoryId: string | null): void {
    this.selectedSubcategory.set(subcategoryId);
  }
}

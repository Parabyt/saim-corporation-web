import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { DEFAULT_APP_CONFIG } from '../../../core/config/app.config.model';
import { Product } from '../../../core/models/catalog.models';
import { ContentStoreService } from '../../../core/services/content-store.service';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-page.component.html',
  styleUrl: './product-page.component.scss'
})
export class ProductPageComponent {
  private readonly contentStore = inject(ContentStoreService);
  private readonly route = inject(ActivatedRoute);

  readonly product = signal<Product | null>(null);
  readonly showPrice = DEFAULT_APP_CONFIG.catalog.showPrice;

  readonly relatedProducts = computed(() => {
    const current = this.product();
    if (!current) {
      return [];
    }

    return this.contentStore
      .products()
      .filter((item) => item.categoryId === current.categoryId && item.id !== current.id)
      .slice(0, 4);
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      this.product.set(slug ? this.contentStore.getProductBySlug(slug) ?? null : null);
    });
  }
}

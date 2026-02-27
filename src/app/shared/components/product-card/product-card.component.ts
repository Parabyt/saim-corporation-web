import { Component, Input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DEFAULT_APP_CONFIG } from '../../../core/config/app.config.model';
import { Product } from '../../../core/models/catalog.models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  readonly showPrice = DEFAULT_APP_CONFIG.catalog.showPrice;

  readonly wished = signal(false);

  toggleWish(): void {
    this.wished.update((current) => !current);
  }
}

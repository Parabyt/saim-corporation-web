import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ContentStoreService } from '../../../core/services/content-store.service';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss'
})
export class SiteHeaderComponent {
  private readonly contentStore = inject(ContentStoreService);

  readonly appName = 'Saim Corporation';
  readonly mobileMenuOpen = signal(false);
  readonly isScrolled = signal(false);

  readonly categoryQuickLinks = this.contentStore.categories;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 30);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((state) => !state);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}

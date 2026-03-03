import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ContentStoreService } from '../../../core/services/content-store.service';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss'
})
export class SiteFooterComponent implements AfterViewInit, OnDestroy {
  @ViewChild('footerRoot', { static: true }) private footerRoot?: ElementRef<HTMLElement>;
  private resizeObserver?: ResizeObserver;
  private readonly contentStore = inject(ContentStoreService);

  readonly year = new Date().getFullYear();
  readonly companyProfile = this.contentStore.companyProfile;
  readonly activeSocials = computed(() => this.companyProfile().socials.filter((item) => item.enabled && item.url.trim().length > 0));

  ngAfterViewInit(): void {
    const footer = this.footerRoot?.nativeElement;
    if (!footer) {
      return;
    }

    this.syncFooterHeight(footer.offsetHeight);
    this.resizeObserver = new ResizeObserver(() => this.syncFooterHeight(footer.offsetHeight));
    this.resizeObserver.observe(footer);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private syncFooterHeight(height: number): void {
    document.documentElement.style.setProperty('--site-footer-height', `${Math.ceil(height)}px`);
  }
}

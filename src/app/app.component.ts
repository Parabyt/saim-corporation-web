import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { filter } from 'rxjs/operators';

import { DEFAULT_APP_CONFIG } from './core/config/app.config.model';
import { ThemeService } from './core/services/theme.service';
import { SiteFooterComponent } from './shared/components/site-footer/site-footer.component';
import { SiteHeaderComponent } from './shared/components/site-header/site-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('routeTransition', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate('340ms cubic-bezier(0.2, 0.8, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AppComponent {
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  readonly routeState = signal(0);
  readonly isHomeRoute = signal(this.checkIsHomeRoute(this.router.url));

  constructor() {
    this.themeService.setTheme(DEFAULT_APP_CONFIG.theme);

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.routeState.update((value) => value + 1);
      this.isHomeRoute.set(this.checkIsHomeRoute(this.router.url));
    });
  }

  private checkIsHomeRoute(url: string): boolean {
    return url === '/' || url.startsWith('/?');
  }
}

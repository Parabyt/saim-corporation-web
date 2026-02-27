import { Injectable, signal } from '@angular/core';

import { DEFAULT_APP_CONFIG } from '../config/app.config.model';
import { ThemeConfig } from '../config/theme.model';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly activeTheme = signal<ThemeConfig>(DEFAULT_APP_CONFIG.theme);

  constructor() {
    this.applyTheme(this.activeTheme());
  }

  setTheme(theme: ThemeConfig): void {
    this.activeTheme.set(theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: ThemeConfig): void {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-primary-dark', theme.colors.primaryDark);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-muted-text', theme.colors.mutedText);
    root.style.setProperty('--color-heading-text', theme.colors.headingText);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--radius-main', theme.radius);
  }
}

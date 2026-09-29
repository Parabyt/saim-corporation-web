import { Injectable, computed, inject, signal } from '@angular/core';
import { AUTH_REPOSITORY, AdminUser } from '../ports/backend.port';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly repository = inject(AUTH_REPOSITORY);
  private readonly userState = signal<AdminUser | null>(null);
  readonly user = this.userState.asReadonly();
  readonly isAdmin = computed(() => this.user()?.role === 'admin');
  readonly isLoggedIn = computed(() => Boolean(this.user()));
  async restore(): Promise<void> { this.userState.set(await this.repository.session()); }
  async login(email: string, password: string): Promise<void> { this.userState.set(await this.repository.login(email, password)); }
  async logout(): Promise<void> { await this.repository.logout(); this.userState.set(null); }
}

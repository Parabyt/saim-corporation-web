import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentStoreService } from '../../../core/services/content-store.service';
import { AuthService } from '../../../core/services/auth.service';
@Component({
  standalone: true, imports: [FormsModule],
  template: `<section class="login"><h1>Admin sign in</h1><form (ngSubmit)="submit()">
    <label>Email<input type="email" name="email" [(ngModel)]="email" autocomplete="username" required /></label>
    <label>Password<input type="password" name="password" [(ngModel)]="password" autocomplete="current-password" required /></label>
    <button [disabled]="busy()">{{ busy() ? 'Signing in…' : 'Sign in' }}</button>
    <p role="alert">{{ error() }}</p></form></section>`,
  styles: [`.login{max-width:420px;margin:4rem auto;padding:2rem}label{display:block;margin:1rem 0}input{display:block;width:100%;padding:.7rem;margin-top:.4rem}button{padding:.8rem 1.5rem}`]
})
export class AdminLoginComponent {
  private readonly content = inject(ContentStoreService);
  private readonly auth = inject(AuthService); private readonly router = inject(Router); private readonly route = inject(ActivatedRoute);
  email = ''; password = ''; readonly busy = signal(false); readonly error = signal('');
  async submit(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true); this.error.set('');
    try {
      await this.auth.login(this.email, this.password); this.password = '';
      await this.content.refresh();
      if (this.content.loadError()) throw new Error(this.content.loadError());
      const target = this.route.snapshot.queryParamMap.get('returnUrl');
      await this.router.navigateByUrl(target === '/customize' ? '/customize' : '/admin');
    } catch (error) { this.error.set(error instanceof Error ? error.message : 'Sign in failed.'); }
    finally { this.busy.set(false); }
  }
}

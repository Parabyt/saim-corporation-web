import { Injectable, computed, inject, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, User, onAuthStateChanged, signInWithPopup, signOut } from '@angular/fire/auth';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth, { optional: true });
  private readonly userState = signal<User | null>(null);

  readonly isAuthAvailable = computed(() => Boolean(this.auth));
  readonly user = computed(() => this.userState());
  readonly isLoggedIn = computed(() => Boolean(this.userState()));
  readonly isAdmin = computed(() => {
    const email = this.userState()?.email?.toLowerCase();
    if (!email) {
      return false;
    }

    return environment.adminEmails.map((item) => item.toLowerCase()).includes(email);
  });

  constructor() {
    if (!this.auth) {
      return;
    }

    onAuthStateChanged(this.auth, (user) => this.userState.set(user));
  }

  async loginWithGoogle(): Promise<void> {
    if (!this.auth) {
      throw new Error('Firebase Auth not configured.');
    }

    await signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  async logout(): Promise<void> {
    if (!this.auth) {
      return;
    }

    await signOut(this.auth);
  }
}

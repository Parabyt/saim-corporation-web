import { Injectable, Injector, inject } from '@angular/core';

import { ContactMessage, ContactMessageDraft } from '../models/contact-message.models';
import { FirebaseCatalogService } from './firebase-catalog.service';

const CONTACT_MESSAGES_STORAGE_KEY = 'saim.contactMessages';

@Injectable({ providedIn: 'root' })
export class ContactMessageService {
  private readonly injector = inject(Injector);

  async sendMessage(draft: ContactMessageDraft): Promise<{ id: string; persistedTo: 'local' | 'firebase' }> {
    const message: ContactMessage = {
      ...draft,
      id: this.newId('msg'),
      createdAt: new Date().toISOString()
    };

    this.persistLocal(message);

    const firebaseCatalog = this.getFirebaseCatalog();
    if (!firebaseCatalog) {
      return { id: message.id, persistedTo: 'local' };
    }

    try {
      const { id, ...payload } = message;
      await firebaseCatalog.addContactMessage(payload);
      return { id: message.id, persistedTo: 'firebase' };
    } catch {
      return { id: message.id, persistedTo: 'local' };
    }
  }

  private getFirebaseCatalog(): FirebaseCatalogService | null {
    try {
      return this.injector.get(FirebaseCatalogService);
    } catch {
      return null;
    }
  }

  private persistLocal(message: ContactMessage): void {
    const existing = this.getLocalMessages();
    localStorage.setItem(CONTACT_MESSAGES_STORAGE_KEY, JSON.stringify([message, ...existing]));
  }

  private getLocalMessages(): ContactMessage[] {
    const raw = localStorage.getItem(CONTACT_MESSAGES_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as ContactMessage[];
    } catch {
      return [];
    }
  }

  private newId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

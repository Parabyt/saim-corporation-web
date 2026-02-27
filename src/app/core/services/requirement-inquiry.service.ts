import { Injectable, Injector, inject } from '@angular/core';

import { RequirementInquiry, RequirementInquiryDraft } from '../models/requirement-inquiry.models';
import { FirebaseCatalogService } from './firebase-catalog.service';

const REQUIREMENTS_STORAGE_KEY = 'saim.requirementInquiries';

@Injectable({ providedIn: 'root' })
export class RequirementInquiryService {
  private readonly injector = inject(Injector);

  async submitRequirement(draft: RequirementInquiryDraft): Promise<{ id: string; persistedTo: 'local' | 'firebase' }> {
    const requirement: RequirementInquiry = {
      ...draft,
      id: this.newId('req'),
      createdAt: new Date().toISOString()
    };

    this.persistLocal(requirement);

    const firebaseCatalog = this.getFirebaseCatalog();
    if (!firebaseCatalog) {
      return { id: requirement.id, persistedTo: 'local' };
    }

    try {
      const { id, ...payload } = requirement;
      await firebaseCatalog.addRequirement(payload);
      return { id: requirement.id, persistedTo: 'firebase' };
    } catch {
      return { id: requirement.id, persistedTo: 'local' };
    }
  }

  async uploadReferenceImage(file: File): Promise<string | null> {
    const firebaseCatalog = this.getFirebaseCatalog();
    if (!firebaseCatalog) {
      return null;
    }

    try {
      return await firebaseCatalog.uploadImage(file, 'requirements');
    } catch {
      return null;
    }
  }

  private getFirebaseCatalog(): FirebaseCatalogService | null {
    try {
      return this.injector.get(FirebaseCatalogService);
    } catch {
      return null;
    }
  }

  private persistLocal(requirement: RequirementInquiry): void {
    const existing = this.getLocalRequirements();
    localStorage.setItem(REQUIREMENTS_STORAGE_KEY, JSON.stringify([requirement, ...existing]));
  }

  private getLocalRequirements(): RequirementInquiry[] {
    const raw = localStorage.getItem(REQUIREMENTS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as RequirementInquiry[];
    } catch {
      return [];
    }
  }

  private newId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

import { Injectable, inject } from '@angular/core';
import { RequirementInquiryDraft } from '../models/requirement-inquiry.models';
import { SUBMISSION_REPOSITORY, MEDIA_REPOSITORY } from '../ports/backend.port';
@Injectable({ providedIn: 'root' })
export class RequirementInquiryService {
  private readonly repository = inject(SUBMISSION_REPOSITORY);
  private readonly media = inject(MEDIA_REPOSITORY);
  async submitRequirement(draft: RequirementInquiryDraft): Promise<{ id: string; persistedTo: 'server' }> {
    return { ...await this.repository.requirement(draft), persistedTo: 'server' };
  }
  async uploadReferenceImage(file: File): Promise<string | null> { try { return await this.media.upload(file, 'requirements'); } catch { return null; } }

}

import { Injectable, inject } from '@angular/core';
import { ContactMessageDraft } from '../models/contact-message.models';
import { SUBMISSION_REPOSITORY, MEDIA_REPOSITORY } from '../ports/backend.port';
@Injectable({ providedIn: 'root' })
export class ContactMessageService {
  private readonly repository = inject(SUBMISSION_REPOSITORY);
  private readonly media = inject(MEDIA_REPOSITORY);
  async sendMessage(draft: ContactMessageDraft): Promise<{ id: string; persistedTo: 'server' }> {
    return { ...await this.repository.contact(draft), persistedTo: 'server' };
  }
}

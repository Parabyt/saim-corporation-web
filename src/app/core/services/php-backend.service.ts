import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Category, Product, Subcategory } from '../models/catalog.models';
import { HomeContent } from '../models/home.models';
import { CompanyProfile } from '../models/company-profile.models';
import { ContactMessageDraft } from '../models/contact-message.models';
import { RequirementInquiryDraft } from '../models/requirement-inquiry.models';
import { AdminUser, AuthRepository, CatalogResource, ContentRepository, ContentSnapshot, MediaFolder, MediaRepository, SubmissionRepository } from '../ports/backend.port';
@Injectable({ providedIn: 'root' })
export class PhpBackendService implements ContentRepository, AuthRepository, MediaRepository, SubmissionRepository {
  private csrf = '';
  private sessionRequest?: Promise<AdminUser | null>;
  async session(): Promise<AdminUser | null> {
    if (!this.sessionRequest) {
      this.sessionRequest = this.request<{ user: AdminUser | null; csrfToken: string }>('auth/session').then(value => {
        this.csrf = value.csrfToken;
        return value.user;
      }).finally(() => { this.sessionRequest = undefined; });
    }
    return this.sessionRequest;
  }
  async login(email: string, password: string): Promise<AdminUser> {
    const result = await this.request<{ user: AdminUser; csrfToken: string }>('auth/login', 'POST', { email, password });
    this.csrf = result.csrfToken;
    return result.user;
  }
  async logout(): Promise<void> { await this.request('auth/logout', 'POST', {}); this.csrf = ''; }
  load(): Promise<ContentSnapshot> { return this.request('content'); }
  save(resource: CatalogResource, value: Category | Subcategory | Product): Promise<ContentSnapshot> {
    return this.request(`${resource}/${encodeURIComponent(value.id)}`, 'PUT', value);
  }
  remove(resource: CatalogResource, id: string): Promise<ContentSnapshot> { return this.request(`${resource}/${encodeURIComponent(id)}`, 'DELETE'); }
  saveHome(value: HomeContent): Promise<ContentSnapshot> { return this.request('home', 'PUT', value); }
  saveCompany(value: CompanyProfile): Promise<ContentSnapshot> { return this.request('company', 'PUT', value); }
  importCatalog(value: Pick<ContentSnapshot, 'categories' | 'subcategories' | 'products'>): Promise<ContentSnapshot> { return this.request('catalog/import', 'POST', value); }
  contact(value: ContactMessageDraft): Promise<{ id: string }> { return this.request('contact-messages', 'POST', value); }
  requirement(value: RequirementInquiryDraft): Promise<{ id: string }> { return this.request('requirements', 'POST', value); }
  async upload(file: File, folder: MediaFolder): Promise<string> {
    const body = new FormData(); body.append('file', file); body.append('folder', folder);
    return (await this.request<{ url: string }>('media', 'POST', body)).url;
  }
  private async request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    if (method !== 'GET' && !this.csrf) await this.session();
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (method !== 'GET') headers['X-CSRF-Token'] = this.csrf;
    if (body !== undefined && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
    const response = await fetch(`${environment.apiBaseUrl}/${path}`, {
      method, credentials: 'same-origin', headers,
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
      signal: AbortSignal.timeout(30000)
    });
    const data = await response.json().catch(() => ({ error: 'The server returned an invalid response.' }));
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) this.csrf = '';
      throw new Error(data.error || 'The request failed. Please try again.');
    }
    return data as T;
  }
}

import { InjectionToken } from '@angular/core';
import { Category, Product, Subcategory } from '../models/catalog.models';
import { HomeContent } from '../models/home.models';
import { CompanyProfile } from '../models/company-profile.models';
import { ContactMessageDraft } from '../models/contact-message.models';
import { RequirementInquiryDraft } from '../models/requirement-inquiry.models';
export interface ContentSnapshot {
  categories: Category[]; subcategories: Subcategory[]; products: Product[];
  home: HomeContent; company: CompanyProfile;
}
export type CatalogResource = 'categories' | 'subcategories' | 'products';
export type MediaFolder = CatalogResource | 'home' | 'requirements';
export interface ContentRepository {
  load(): Promise<ContentSnapshot>;
  save(resource: CatalogResource, value: Category | Subcategory | Product): Promise<ContentSnapshot>;
  remove(resource: CatalogResource, id: string): Promise<ContentSnapshot>;
  saveHome(value: HomeContent): Promise<ContentSnapshot>;
  saveCompany(value: CompanyProfile): Promise<ContentSnapshot>;
  importCatalog(value: Pick<ContentSnapshot, 'categories' | 'subcategories' | 'products'>): Promise<ContentSnapshot>;
}
export interface MediaRepository { upload(file: File, folder: MediaFolder): Promise<string>; }
export interface AdminUser { id: number; email: string; role: 'admin'; }
export interface AuthRepository {
  session(): Promise<AdminUser | null>;
  login(email: string, password: string): Promise<AdminUser>;
  logout(): Promise<void>;
}
export interface SubmissionRepository {
  contact(value: ContactMessageDraft): Promise<{ id: string }>;
  requirement(value: RequirementInquiryDraft): Promise<{ id: string }>;
}
export const CONTENT_REPOSITORY = new InjectionToken<ContentRepository>('CONTENT_REPOSITORY');
export const MEDIA_REPOSITORY = new InjectionToken<MediaRepository>('MEDIA_REPOSITORY');
export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>('AUTH_REPOSITORY');
export const SUBMISSION_REPOSITORY = new InjectionToken<SubmissionRepository>('SUBMISSION_REPOSITORY');

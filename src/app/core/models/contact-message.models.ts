export interface ContactMessage {
  id: string;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  subject: string;
  message: string;
  acceptedTerms: boolean;
  captchaConfirmed: boolean;
  captchaToken?: string;
  source: 'contact-page' | 'other';
  createdAt: string;
}

export type ContactMessageDraft = Omit<ContactMessage, 'id' | 'createdAt'>;

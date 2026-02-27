export interface RequirementInquiry {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  productFocus: string;
  targetQuantity: string;
  message: string;
  referenceImageUrl?: string;
  source: 'home-trade-strip' | 'hero-cta' | 'other';
  createdAt: string;
}

export type RequirementInquiryDraft = Omit<RequirementInquiry, 'id' | 'createdAt'>;

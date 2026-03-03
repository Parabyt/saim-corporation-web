export type SocialPlatform = 'instagram' | 'facebook' | 'linkedin' | 'youtube';

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  enabled: boolean;
  url: string;
}

export interface CompanyProfile {
  phone: string;
  email: string;
  address: string;
  socials: SocialLink[];
}

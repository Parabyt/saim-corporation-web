import { ThemeConfig } from './theme.model';

export interface AppConfig {
  appName: string;
  heroHeadline: string;
  heroTagline: string;
  heroBackgroundImage: string;
  contactEmail: string;
  contactPhone: string;
  catalog: {
    showPrice: boolean;
  };
  theme: ThemeConfig;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  appName: 'Saim Corporation',
  heroHeadline: 'Premium Import-Export Textile Marketplace',
  heroTagline: 'Scalable catalog operations, quality-focused sourcing, and global supply workflows from one storefront.',
  heroBackgroundImage: 'https://images.unsplash.com/photo-1451481454041-104482d8e284?auto=format&fit=crop&w=1500&q=80',
  contactEmail: 'info@saim-corporation.com',
  contactPhone: '+1 (555) 200-4567',
  catalog: {
    showPrice: false
  },
  theme: {
    name: 'Kumas Inspired',
    colors: {
      primary: '#ffaa00',
      primaryDark: '#031c37',
      accent: '#ffaa00',
      surface: '#ffffff',
      mutedText: '#4c5d70',
      headingText: '#031c37',
      border: '#e7e7e7'
    },
    radius: '10px'
  }
};

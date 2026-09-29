import { HomeContent } from '../models/home.models';
import { CompanyProfile } from '../models/company-profile.models';
const LEGACY_NEWSLETTER_TITLE = 'Stay Updated with New Fabric Drops';
const LEGACY_NEWSLETTER_TEXT = 'Get new category launches, stock alerts, and wholesale offers directly in your inbox.';

export const DEFAULT_HOME_CONTENT: HomeContent = {
  heroSlides: [
    {
      id: 'hero-1',
      title: 'Leather Jackets, Belts, And Bags For Export',
      subtitle: 'Premium stitched leather collections for international distributors and private labels.',
      imageUrl: 'https://images.unsplash.com/photo-1551048632-948310cee98b?auto=format&fit=crop&w=1800&q=80',
      tags: ['#LeatherJackets', '#LeatherBelts', '#LeatherBags', '#GlobalExport']
    },
    {
      id: 'hero-2',
      title: 'Team Sports Uniforms And Football Gear',
      subtitle: 'Wholesale sports uniforms and match-day apparel tailored for clubs and academies.',
      imageUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1800&q=80',
      tags: ['#SportsUniform', '#FootballWear', '#TeamKits', '#BulkSupply']
    },
    {
      id: 'hero-3',
      title: 'Gym Wear And Boxing Equipment Range',
      subtitle: 'Training apparel, boxing gloves, and lifting belts built for performance markets.',
      imageUrl: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=1800&q=80',
      tags: ['#GymWear', '#BoxingGloves', '#GymBelts', '#FitnessExport']
    },
    {
      id: 'hero-4',
      title: 'Industrial And Service Uniform Programs',
      subtitle: 'Durable uniform sets for manufacturing, hospitality, and service teams.',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1800&q=80',
      tags: ['#Uniforms', '#WorkUniform', '#InstitutionalSupply', '#CustomOrders']
    },
    {
      id: 'hero-5',
      title: 'Performance Sports Apparel For Global Buyers',
      subtitle: 'Breathable, moisture-managed sportswear for retail and teamwear segments.',
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1800&q=80',
      tags: ['#SportsWear', '#PerformanceFabric', '#Wholesale', '#GlobalTrade']
    },
    {
      id: 'hero-6',
      title: 'Private Label Leather And Activewear Manufacturing',
      subtitle: 'End-to-end OEM support for export-ready apparel and accessory product lines.',
      imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1800&q=80',
      tags: ['#PrivateLabel', '#LeatherGoods', '#Activewear', '#OEMExport']
    }
  ],
  marqueeText: 'FAST DELIVERY • HIGH STOCK AVAILABILITY • EXPORT QUALITY • CUSTOM ORDERS • WHOLESALE READY •',
  newsletterTitle: 'Share Your Sourcing Brief',
  newsletterText:
    'Tell us your product specs, target market, and quantity goals. We will map the right manufacturing route, quality plan, and shipping mode for your import program.',
  blocks: [
    {
      id: 'blk-1',
      title: 'Export Ready Stock',
      subtitle: 'High-volume lots prepared for global dispatch.',
      imageUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1000&q=80',
      link: '/catalog'
    },
    {
      id: 'blk-2',
      title: 'Trend Driven Patterns',
      subtitle: 'Fast-moving collections for seasonal demand.',
      imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=80',
      link: '/catalog'
    },
    {
      id: 'blk-3',
      title: 'Wholesale Pricing',
      subtitle: 'Optimized sourcing for repeat B2B orders.',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80',
      link: '/catalog'
    }
  ]
};

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  phone: '+92 300 0000000',
  email: 'exports@saimcorporation.com',
  address: 'Sialkot, Pakistan',
  socials: [
    { platform: 'instagram', label: 'Instagram', enabled: true, url: 'https://instagram.com/' },
    { platform: 'facebook', label: 'Facebook', enabled: true, url: 'https://facebook.com/' },
    { platform: 'linkedin', label: 'LinkedIn', enabled: true, url: 'https://linkedin.com/' },
    { platform: 'youtube', label: 'YouTube', enabled: true, url: 'https://youtube.com/' }
  ]
};


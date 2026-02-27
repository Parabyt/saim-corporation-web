import { Category, Product, Subcategory } from '../models/catalog.models';

type SeedSubcategory = {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  categorySlug: string;
};

type SeedProduct = {
  title: string;
  description: string;
  imageUrl: string;
  originCountry: string;
  price: number;
  categorySlug: string;
  subcategorySlug: string;
};

const pexels = (id: string, width = 1600): string =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;

export const NICHE_CATEGORIES: Omit<Category, 'id'>[] = [
  {
    slug: 'sports-goods-equipment',
    title: 'Sports Goods & Equipment',
    imageUrl: pexels('1267320'),
    description: 'Export-ready sports gear for training centers, clubs, and distributors.'
  },
  {
    slug: 'leather-products',
    title: 'Leather Products',
    imageUrl: pexels('7679725'),
    description: 'Premium leather jackets, belts, wallets, and bags crafted for global retail markets.'
  },
  {
    slug: 'apparel-textile-sportswear',
    title: 'Apparel & Textile (Sportswear)',
    imageUrl: pexels('1884574'),
    description: 'High-performance sportswear and active textiles tailored for bulk programs.'
  },
  {
    slug: 'martial-arts-boxing-gear',
    title: 'Martial Arts & Boxing Gear',
    imageUrl: pexels('6296107'),
    description: 'Professional-grade boxing and MMA gear for academies, gyms, and wholesale buyers.'
  },
  {
    slug: 'uniforms-workwear',
    title: 'Uniforms & Workwear',
    imageUrl: pexels('33150526'),
    description: 'Structured uniform and workwear solutions for institutional and corporate sectors.'
  },
  {
    slug: 'bags-travel-accessories',
    title: 'Bags & Travel Accessories',
    imageUrl: pexels('26649016'),
    description: 'Durable travel, utility, and duffle bag collections built for export demand.'
  }
];

export const NICHE_SUBCATEGORY_SEEDS: SeedSubcategory[] = [
  {
    categorySlug: 'sports-goods-equipment',
    slug: 'football-equipment',
    title: 'Football Equipment',
    description: 'Balls, training accessories, cones, and protective gear for football programs.',
    imageUrl: pexels('274506')
  },
  {
    categorySlug: 'sports-goods-equipment',
    slug: 'cricket-gear',
    title: 'Cricket Gear',
    description: 'Bats, pads, gloves, and helmets designed for club and academy use.',
    imageUrl: pexels('1267320')
  },
  {
    categorySlug: 'sports-goods-equipment',
    slug: 'fitness-equipment',
    title: 'Fitness Equipment',
    description: 'Core fitness and conditioning equipment for commercial gyms and retailers.',
    imageUrl: pexels('1552252')
  },
  {
    categorySlug: 'leather-products',
    slug: 'leather-jackets',
    title: 'Leather Jackets',
    description: 'Classic and modern jacket silhouettes in premium genuine leather.',
    imageUrl: pexels('6764316')
  },
  {
    categorySlug: 'leather-products',
    slug: 'leather-belts-wallets',
    title: 'Leather Belts & Wallets',
    description: 'Everyday leather accessories with durable stitching and refined finishing.',
    imageUrl: pexels('2976374')
  },
  {
    categorySlug: 'leather-products',
    slug: 'leather-bags',
    title: 'Leather Bags',
    description: 'Messenger, tote, and business bags engineered for frequent use.',
    imageUrl: pexels('1152077')
  },
  {
    categorySlug: 'apparel-textile-sportswear',
    slug: 'team-sportswear',
    title: 'Team Sportswear',
    description: 'Match and training kits for clubs, schools, and franchise teams.',
    imageUrl: pexels('1884574')
  },
  {
    categorySlug: 'apparel-textile-sportswear',
    slug: 'compression-activewear',
    title: 'Compression & Activewear',
    description: 'Breathable activewear with stretch comfort and moisture management.',
    imageUrl: pexels('4662438')
  },
  {
    categorySlug: 'apparel-textile-sportswear',
    slug: 'training-tracksuits',
    title: 'Training Tracksuits',
    description: 'Warm-up and travel tracksuits for performance and athleisure markets.',
    imageUrl: pexels('2294354')
  },
  {
    categorySlug: 'martial-arts-boxing-gear',
    slug: 'boxing-gloves',
    title: 'Boxing Gloves',
    description: 'Training and sparring gloves in multiple weights and protection levels.',
    imageUrl: pexels('4761799')
  },
  {
    categorySlug: 'martial-arts-boxing-gear',
    slug: 'mma-protective-gear',
    title: 'MMA Protective Gear',
    description: 'Head guards, shin protection, and sparring safety essentials.',
    imageUrl: pexels('8612016')
  },
  {
    categorySlug: 'martial-arts-boxing-gear',
    slug: 'gym-belts-wraps',
    title: 'Gym Belts & Wraps',
    description: 'Weight belts and wrist support accessories for strength training.',
    imageUrl: pexels('6550823')
  },
  {
    categorySlug: 'uniforms-workwear',
    slug: 'school-uniforms',
    title: 'School Uniforms',
    description: 'Complete schoolwear sets with consistent fabric and sizing standards.',
    imageUrl: pexels('8613089')
  },
  {
    categorySlug: 'uniforms-workwear',
    slug: 'corporate-industrial-uniforms',
    title: 'Corporate & Industrial Uniforms',
    description: 'Structured work uniforms for production, logistics, and service teams.',
    imageUrl: pexels('532565')
  },
  {
    categorySlug: 'uniforms-workwear',
    slug: 'hospitality-healthcare-uniforms',
    title: 'Hospitality & Healthcare Uniforms',
    description: 'Comfort-first uniforms for clinical, hospitality, and front-office roles.',
    imageUrl: pexels('8460034')
  },
  {
    categorySlug: 'bags-travel-accessories',
    slug: 'duffle-gym-bags',
    title: 'Duffle & Gym Bags',
    description: 'Sport-focused carry solutions with reinforced panels and zippers.',
    imageUrl: pexels('3621185')
  },
  {
    categorySlug: 'bags-travel-accessories',
    slug: 'travel-backpacks',
    title: 'Travel Backpacks',
    description: 'Ergonomic backpacks with compartmentalized storage layouts.',
    imageUrl: pexels('2905238')
  },
  {
    categorySlug: 'bags-travel-accessories',
    slug: 'tactical-utility-bags',
    title: 'Tactical & Utility Bags',
    description: 'Rugged utility carry systems for field, travel, and cargo operations.',
    imageUrl: pexels('3183150')
  }
];

export const NICHE_PRODUCT_SEEDS: SeedProduct[] = [
  {
    categorySlug: 'sports-goods-equipment',
    subcategorySlug: 'football-equipment',
    title: 'Pro Match Football Size 5',
    description: 'Thermally bonded match ball with consistent flight and shape retention.',
    imageUrl: pexels('274506'),
    originCountry: 'Pakistan',
    price: 22
  },
  {
    categorySlug: 'sports-goods-equipment',
    subcategorySlug: 'football-equipment',
    title: 'Speed Training Cone Set',
    description: 'Flexible marker cone set for agility drills and tactical sessions.',
    imageUrl: pexels('1618200'),
    originCountry: 'Pakistan',
    price: 9.5
  },
  {
    categorySlug: 'sports-goods-equipment',
    subcategorySlug: 'cricket-gear',
    title: 'English Willow Cricket Bat',
    description: 'Balanced bat profile for competitive and professional level play.',
    imageUrl: pexels('1267320'),
    originCountry: 'Pakistan',
    price: 78
  },
  {
    categorySlug: 'sports-goods-equipment',
    subcategorySlug: 'cricket-gear',
    title: 'Cricket Batting Gloves Pair',
    description: 'Shock-absorbing palm and finger protection for long innings.',
    imageUrl: pexels('1267320'),
    originCountry: 'Pakistan',
    price: 18
  },
  {
    categorySlug: 'sports-goods-equipment',
    subcategorySlug: 'fitness-equipment',
    title: 'Hex Dumbbell Pair 10kg',
    description: 'Durable grip dumbbells suited for gyms and rehabilitation centers.',
    imageUrl: pexels('1552252'),
    originCountry: 'China',
    price: 36
  },
  {
    categorySlug: 'sports-goods-equipment',
    subcategorySlug: 'fitness-equipment',
    title: 'Resistance Band Pro Kit',
    description: 'Multi-level resistance set with handles and door anchor.',
    imageUrl: pexels('4498574'),
    originCountry: 'China',
    price: 14
  },
  {
    categorySlug: 'leather-products',
    subcategorySlug: 'leather-jackets',
    title: 'Men Biker Leather Jacket',
    description: 'Classic biker fit with reinforced seams and premium lining.',
    imageUrl: pexels('6764316'),
    originCountry: 'Pakistan',
    price: 110
  },
  {
    categorySlug: 'leather-products',
    subcategorySlug: 'leather-jackets',
    title: 'Women Slim Fit Leather Jacket',
    description: 'Contemporary silhouette with polished finish and comfortable structure.',
    imageUrl: pexels('1926769'),
    originCountry: 'Pakistan',
    price: 118
  },
  {
    categorySlug: 'leather-products',
    subcategorySlug: 'leather-belts-wallets',
    title: 'Genuine Leather Formal Belt',
    description: 'Minimal buckle profile and edge-finished strap for formalwear.',
    imageUrl: pexels('2976374'),
    originCountry: 'Pakistan',
    price: 16
  },
  {
    categorySlug: 'leather-products',
    subcategorySlug: 'leather-belts-wallets',
    title: 'Bi-fold Leather Wallet',
    description: 'Compact wallet with organized card slots and stitched durability.',
    imageUrl: pexels('2079249'),
    originCountry: 'Pakistan',
    price: 14
  },
  {
    categorySlug: 'leather-products',
    subcategorySlug: 'leather-bags',
    title: 'Executive Leather Messenger Bag',
    description: 'Structured messenger with laptop compartment and shoulder strap.',
    imageUrl: pexels('1152077'),
    originCountry: 'Pakistan',
    price: 64
  },
  {
    categorySlug: 'leather-products',
    subcategorySlug: 'leather-bags',
    title: 'Leather Weekender Travel Bag',
    description: 'Spacious travel bag with reinforced base and premium hardware.',
    imageUrl: pexels('936075'),
    originCountry: 'Pakistan',
    price: 89
  },
  {
    categorySlug: 'apparel-textile-sportswear',
    subcategorySlug: 'team-sportswear',
    title: 'Custom Football Team Jersey',
    description: 'Breathable jersey with sublimation print support and logo placement.',
    imageUrl: pexels('1884574'),
    originCountry: 'Pakistan',
    price: 19
  },
  {
    categorySlug: 'apparel-textile-sportswear',
    subcategorySlug: 'team-sportswear',
    title: 'Basketball Match Kit Set',
    description: 'Lightweight jersey and shorts set for team-level performance.',
    imageUrl: pexels('1752757'),
    originCountry: 'Pakistan',
    price: 21
  },
  {
    categorySlug: 'apparel-textile-sportswear',
    subcategorySlug: 'compression-activewear',
    title: 'Compression Base Layer Top',
    description: 'Body-fit performance top for training and match-day layering.',
    imageUrl: pexels('4662438'),
    originCountry: 'Pakistan',
    price: 15
  },
  {
    categorySlug: 'apparel-textile-sportswear',
    subcategorySlug: 'compression-activewear',
    title: 'Active Training Leggings',
    description: 'Flexible and moisture-wicking leggings designed for high mobility.',
    imageUrl: pexels('4498156'),
    originCountry: 'Pakistan',
    price: 17
  },
  {
    categorySlug: 'apparel-textile-sportswear',
    subcategorySlug: 'training-tracksuits',
    title: 'Polyester Team Tracksuit',
    description: 'Two-piece tracksuit with durable stitching for daily training.',
    imageUrl: pexels('2294354'),
    originCountry: 'Pakistan',
    price: 28
  },
  {
    categorySlug: 'apparel-textile-sportswear',
    subcategorySlug: 'training-tracksuits',
    title: 'Performance Warm-Up Suit',
    description: 'Lightweight warm-up suit for team travel and pre-game sessions.',
    imageUrl: pexels('7679720'),
    originCountry: 'Pakistan',
    price: 31
  },
  {
    categorySlug: 'martial-arts-boxing-gear',
    subcategorySlug: 'boxing-gloves',
    title: 'Pro Sparring Boxing Gloves',
    description: 'Multi-layer foam gloves designed for advanced sparring cycles.',
    imageUrl: pexels('4761799'),
    originCountry: 'Pakistan',
    price: 34
  },
  {
    categorySlug: 'martial-arts-boxing-gear',
    subcategorySlug: 'boxing-gloves',
    title: 'Training Bag Gloves',
    description: 'Durable gloves optimized for heavy bag and mitt work.',
    imageUrl: pexels('4162581'),
    originCountry: 'Pakistan',
    price: 24
  },
  {
    categorySlug: 'martial-arts-boxing-gear',
    subcategorySlug: 'mma-protective-gear',
    title: 'MMA Shin Guard Set',
    description: 'Contoured shin protection with secure dual-strap closure.',
    imageUrl: pexels('8612016'),
    originCountry: 'Pakistan',
    price: 28
  },
  {
    categorySlug: 'martial-arts-boxing-gear',
    subcategorySlug: 'mma-protective-gear',
    title: 'Combat Head Guard',
    description: 'Lightweight impact guard with full-coverage cheek protection.',
    imageUrl: pexels('7045444'),
    originCountry: 'Pakistan',
    price: 32
  },
  {
    categorySlug: 'martial-arts-boxing-gear',
    subcategorySlug: 'gym-belts-wraps',
    title: 'Leather Weight Lifting Belt',
    description: 'Firm core-support belt for heavy lifts and strength sessions.',
    imageUrl: pexels('6550823'),
    originCountry: 'Pakistan',
    price: 26
  },
  {
    categorySlug: 'martial-arts-boxing-gear',
    subcategorySlug: 'gym-belts-wraps',
    title: 'Elastic Wrist Wrap Pair',
    description: 'Secure wrist wraps designed for pressing and combat workouts.',
    imageUrl: pexels('1552242'),
    originCountry: 'Pakistan',
    price: 9
  },
  {
    categorySlug: 'uniforms-workwear',
    subcategorySlug: 'school-uniforms',
    title: 'School Shirt & Trouser Set',
    description: 'Daily-wear school uniform set with colorfast fabric quality.',
    imageUrl: pexels('8613089'),
    originCountry: 'Pakistan',
    price: 22
  },
  {
    categorySlug: 'uniforms-workwear',
    subcategorySlug: 'school-uniforms',
    title: 'School Blazer Program Pack',
    description: 'Structured blazer and skirt/trouser variants for institutions.',
    imageUrl: pexels('3148452'),
    originCountry: 'Pakistan',
    price: 35
  },
  {
    categorySlug: 'uniforms-workwear',
    subcategorySlug: 'corporate-industrial-uniforms',
    title: 'Industrial Coverall Suit',
    description: 'Heavy-duty coveralls for plant, workshop, and maintenance teams.',
    imageUrl: pexels('532565'),
    originCountry: 'Pakistan',
    price: 29
  },
  {
    categorySlug: 'uniforms-workwear',
    subcategorySlug: 'corporate-industrial-uniforms',
    title: 'Corporate Service Uniform Set',
    description: 'Tailored shirts, trousers, and outerwear for service operations.',
    imageUrl: pexels('532568'),
    originCountry: 'Pakistan',
    price: 27
  },
  {
    categorySlug: 'uniforms-workwear',
    subcategorySlug: 'hospitality-healthcare-uniforms',
    title: 'Healthcare Scrub Set',
    description: 'Comfort stretch scrub set designed for long-shift use.',
    imageUrl: pexels('8460034'),
    originCountry: 'Pakistan',
    price: 18
  },
  {
    categorySlug: 'uniforms-workwear',
    subcategorySlug: 'hospitality-healthcare-uniforms',
    title: 'Hospitality Front Desk Uniform',
    description: 'Formal hospitality uniform with custom trim and branding options.',
    imageUrl: pexels('3771089'),
    originCountry: 'Pakistan',
    price: 24
  },
  {
    categorySlug: 'bags-travel-accessories',
    subcategorySlug: 'duffle-gym-bags',
    title: 'Water-Resistant Gym Duffle',
    description: 'Compartmented duffle bag for gym, sport, and daily carry.',
    imageUrl: pexels('3621185'),
    originCountry: 'China',
    price: 21
  },
  {
    categorySlug: 'bags-travel-accessories',
    subcategorySlug: 'duffle-gym-bags',
    title: 'Team Travel Duffle Large',
    description: 'Large-volume duffle with reinforced handles for team logistics.',
    imageUrl: pexels('3621185'),
    originCountry: 'China',
    price: 24
  },
  {
    categorySlug: 'bags-travel-accessories',
    subcategorySlug: 'travel-backpacks',
    title: 'Multi-Compartment Travel Backpack',
    description: 'Travel-ready backpack with laptop sleeve and side utility access.',
    imageUrl: pexels('2905238'),
    originCountry: 'China',
    price: 27
  },
  {
    categorySlug: 'bags-travel-accessories',
    subcategorySlug: 'travel-backpacks',
    title: 'Urban Business Backpack',
    description: 'Slim-profile backpack designed for business and short travel routes.',
    imageUrl: pexels('842811'),
    originCountry: 'China',
    price: 25
  },
  {
    categorySlug: 'bags-travel-accessories',
    subcategorySlug: 'tactical-utility-bags',
    title: 'Modular Utility Carry Bag',
    description: 'Rugged utility bag with high-capacity pocket configuration.',
    imageUrl: pexels('3183150'),
    originCountry: 'China',
    price: 33
  },
  {
    categorySlug: 'bags-travel-accessories',
    subcategorySlug: 'tactical-utility-bags',
    title: 'Outdoor Tactical Backpack',
    description: 'Load-stable tactical backpack suited for rugged travel and field operations.',
    imageUrl: pexels('1249611'),
    originCountry: 'China',
    price: 36
  }
];

export type { SeedProduct, SeedSubcategory };

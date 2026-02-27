export interface HomeBlock {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
}

export interface HeroSlideContent {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  tags: string[];
}

export interface HomeContent {
  heroSlides: HeroSlideContent[];
  marqueeText: string;
  blocks: HomeBlock[];
  newsletterTitle: string;
  newsletterText: string;
}

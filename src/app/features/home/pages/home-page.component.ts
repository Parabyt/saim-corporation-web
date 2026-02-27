import { Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HeroSlideContent } from '../../../core/models/home.models';
import { ContentStoreService } from '../../../core/services/content-store.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

const FALLBACK_HERO_SLIDE: HeroSlideContent = {
  id: 'hero-fallback',
  title: 'Global Export Operations You Can Scale',
  subtitle: 'Flexible sourcing and reliable fulfillment for international buyers.',
  imageUrl: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&w=1700&q=80',
  tags: ['#Export', '#Logistics', '#B2B']
};

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit, OnDestroy {
  private readonly contentStore = inject(ContentStoreService);
  private autoSlideTimer: ReturnType<typeof setInterval> | null = null;
  @ViewChild('categoriesTrack') private categoriesTrack?: ElementRef<HTMLDivElement>;
  readonly slideDurationMs = 6200;

  readonly homeContent = this.contentStore.homeContent;
  readonly allCategories = this.contentStore.categories;
  readonly featuredCategories = computed(() => this.contentStore.categories().slice(0, 6));
  readonly featuredProducts = computed(() => this.contentStore.products().slice(0, 8));

  readonly activeSlideIndex = signal(0);
  readonly heroSlides = computed(() => {
    const slides = this.homeContent().heroSlides;
    return slides.length > 0 ? slides : [FALLBACK_HERO_SLIDE];
  });
  readonly activeIndicatorIndex = computed(() => this.activeSlideIndex() % this.heroSlides().length);
  readonly currentSlide = computed(() => {
    const slides = this.heroSlides();
    const safeIndex = this.activeSlideIndex() % slides.length;
    return slides[safeIndex];
  });

  readonly trackTransform = computed(() => {
    const safeIndex = this.activeSlideIndex() % this.heroSlides().length;
    return `translateX(-${safeIndex * 100}%)`;
  });

  readonly testimonials = [
    {
      quote: 'The quality consistency and dispatch speed are excellent for our wholesale operations.',
      author: 'A. Demir'
    },
    {
      quote: 'Great catalog depth and accurate product visuals. Reorder workflows are smooth.',
      author: 'Global Textile Buyer'
    },
    {
      quote: 'We scaled our sourcing with this platform and reduced supplier turnaround time significantly.',
      author: 'M. Rehman'
    }
  ];

  readonly companyPillars = [
    {
      title: 'What We Offer',
      text: 'Leather goods, team sportswear, gym wear, uniforms, and private-label export programs for global buyers.'
    },
    {
      title: 'What We Manufacture',
      text: 'Jackets, belts, bags, football/team kits, boxing gloves, gym belts, and custom uniform lines at scale.'
    },
    {
      title: 'Our Achievements',
      text: 'Trusted delivery performance, repeat B2B contracts, and consistent quality benchmarks across categories.'
    },
    {
      title: 'Our Network',
      text: 'An integrated sourcing and logistics network connecting production hubs, freight partners, and importers.'
    }
  ];

  readonly companyMetrics = [
    { value: '12+', label: 'Years Export Experience' },
    { value: '40+', label: 'Countries Served' },
    { value: '300+', label: 'B2B Clients & Partners' }
  ];

  readonly processStages = [
    {
      title: 'Material Sourcing',
      imageUrl: 'https://images.pexels.com/photos/4498574/pexels-photo-4498574.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      title: 'Pattern & Tech Pack Development',
      imageUrl: 'https://images.pexels.com/photos/6764316/pexels-photo-6764316.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      title: 'Cutting & Component Preparation',
      imageUrl: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      title: 'Stitching & Product Assembly',
      imageUrl: 'https://images.pexels.com/photos/532568/pexels-photo-532568.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      title: 'Quality Inspection',
      imageUrl: 'https://images.pexels.com/photos/8612016/pexels-photo-8612016.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      title: 'Packing & Export Logistics',
      imageUrl: 'https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=1200'
    }
  ];

  readonly exportDestinations = ['USA', 'Germany', 'Australia', 'China', 'UAE', 'Malaysia', 'Italy', 'Spain', 'Japan'];
  readonly tradeQuickFacts = [
    { value: 'Flexible MOQ', label: 'Pilot runs to container-level volume' },
    { value: 'AQL Quality Checks', label: 'Inspection checkpoints before dispatch' },
    { value: 'Multi-Mode Shipping', label: 'Sea, air, and mixed freight programs' }
  ];

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
    }
  }

  setSlide(index: number): void {
    if (index === this.activeSlideIndex() || index < 0 || index >= this.heroSlides().length) {
      return;
    }

    this.activeSlideIndex.set(index);
    this.startAutoSlide();
  }

  previousSlide(): void {
    this.activeSlideIndex.update((current) => (current - 1 + this.heroSlides().length) % this.heroSlides().length);
    this.startAutoSlide();
  }

  nextSlide(): void {
    this.activeSlideIndex.update((current) => (current + 1) % this.heroSlides().length);
    this.startAutoSlide();
  }

  scrollCategories(direction: 'prev' | 'next'): void {
    const track = this.categoriesTrack?.nativeElement;
    if (!track) {
      return;
    }

    const step = Math.max(track.clientWidth * 0.8, 360);
    track.scrollBy({
      left: direction === 'next' ? step : -step,
      behavior: 'smooth'
    });
  }

  private startAutoSlide(): void {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
    }

    this.autoSlideTimer = setInterval(() => {
      this.activeSlideIndex.update((current) => (current + 1) % this.heroSlides().length);
    }, this.slideDurationMs);
  }
}

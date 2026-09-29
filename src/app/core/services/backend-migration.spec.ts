import { TestBed } from '@angular/core/testing';
import { CONTENT_REPOSITORY, MEDIA_REPOSITORY, ContentRepository, ContentSnapshot } from '../ports/backend.port';
import { DEFAULT_HOME_CONTENT, DEFAULT_COMPANY_PROFILE } from '../data/default-content';
import { ContentStoreService } from './content-store.service';
import { AdminCatalogService } from './admin-catalog.service';

describe('Backend migration', () => {
  let backend: jasmine.SpyObj<ContentRepository>;
  let store: ContentStoreService;
  let admin: AdminCatalogService;
  let initial: ContentSnapshot;
  beforeEach(() => {
    backend = jasmine.createSpyObj('ContentRepository', ['load','save','remove','saveHome','saveCompany','importCatalog']);
    TestBed.configureTestingModule({ providers: [
      { provide: CONTENT_REPOSITORY, useValue: backend },
      { provide: MEDIA_REPOSITORY, useValue: { upload: jasmine.createSpy('upload') } }
    ] });
    store = TestBed.inject(ContentStoreService); admin = TestBed.inject(AdminCatalogService);
    initial = { categories: [{ id: 'cat', slug: 'category', title: 'Category', description: 'Description', imageUrl: '/media/old.webp' }],
      subcategories: [], products: [{ id: 'product', slug: 'product', title: 'Product', description: 'Description',
        categoryId: 'cat', imageUrl: '/media/old.webp', gallery: ['/media/old.webp','https://example.com/detail.webp'],
        price: 10, currency: 'USD', originCountry: 'Pakistan' }], home: structuredClone(DEFAULT_HOME_CONTENT), company: structuredClone(DEFAULT_COMPANY_PROFILE) };
    store.accept(initial);
  });
  afterEach(() => localStorage.removeItem('saim.api.snapshot'));
  it('leaves the storefront unchanged when a save fails', async () => {
    backend.save.and.rejectWith(new Error('Database offline'));
    await expectAsync(admin.updateCategory('cat', { title: 'Changed' })).toBeRejectedWithError('Database offline');
    expect(store.categories()[0].title).toBe('Category');
  });
  it('does not optimistically delete local rows on failed server delete', async () => {
    backend.remove.and.rejectWith(new Error('Not authorized'));
    await expectAsync(admin.deleteCategory('cat')).toBeRejected();
    expect(store.categories().length).toBe(1); expect(store.products().length).toBe(1);
  });
  it('preserves additional gallery images when replacing the cover', async () => {
    backend.save.and.resolveTo(initial);
    await admin.updateProduct('product', { imageUrl: '/media/new.webp' });
    expect(backend.save).toHaveBeenCalledWith('products', jasmine.objectContaining({
      gallery: ['/media/new.webp', 'https://example.com/detail.webp']
    }));
  });
  it('does not resurrect deleted records from a cache when the server returns an empty catalog', async () => {
    backend.load.and.resolveTo({ ...initial, categories: [], subcategories: [], products: [] });
    await store.refresh();
    expect(store.categories()).toEqual([]); expect(store.products()).toEqual([]);
  });
  it('retains the cached snapshot and reports a failed read', async () => {
    backend.load.and.rejectWith(new Error('Offline')); await store.refresh();
    expect(store.categories()).toEqual(initial.categories); expect(store.loadError()).toBe('Offline');
  });
  it('does not publish a failed slider change', async () => {
    backend.saveHome.and.rejectWith(new Error('Validation failed'));
    await expectAsync(admin.updateHeroSlides([])).toBeRejected();
    expect(store.homeContent().heroSlides.length).toBe(initial.home.heroSlides.length);
  });
});

import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Category, Product, Subcategory } from '../../../core/models/catalog.models';
import { AdminCatalogService } from '../../../core/services/admin-catalog.service';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss'
})
export class AdminPageComponent {
  private readonly adminCatalog = inject(AdminCatalogService);

  readonly categories = this.adminCatalog.categories;
  readonly subcategories = this.adminCatalog.subcategories;
  readonly products = this.adminCatalog.products;

  readonly statusMessage = signal('');
  readonly categorySearch = signal('');
  readonly subcategorySearch = signal('');
  readonly productSearch = signal('');

  readonly editingCategoryId = signal<string | null>(null);
  readonly editingSubcategoryId = signal<string | null>(null);
  readonly editingProductId = signal<string | null>(null);

  readonly categoryForm = {
    title: '',
    description: '',
    imageUrl: ''
  };

  readonly subcategoryForm = {
    categoryId: '',
    title: '',
    description: '',
    imageUrl: ''
  };

  readonly productForm = {
    categoryId: '',
    subcategoryId: '',
    title: '',
    description: '',
    imageUrl: '',
    originCountry: '',
    price: 0
  };

  readonly subcategoriesForProduct = computed(() => {
    const categoryId = this.productForm.categoryId;
    return this.subcategories().filter((item) => item.categoryId === categoryId);
  });

  readonly subcategoriesForSubcategoryForm = computed(() => this.categories());
  readonly filteredCategories = computed(() => {
    const query = this.categorySearch().trim().toLowerCase();
    if (!query) {
      return this.categories();
    }

    return this.categories().filter(
      (item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
    );
  });

  readonly filteredSubcategories = computed(() => {
    const query = this.subcategorySearch().trim().toLowerCase();
    if (!query) {
      return this.subcategories();
    }

    return this.subcategories().filter((item) => {
      const categoryName = this.categoryTitle(item.categoryId).toLowerCase();
      return item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query) || categoryName.includes(query);
    });
  });

  readonly filteredProducts = computed(() => {
    const query = this.productSearch().trim().toLowerCase();
    if (!query) {
      return this.products();
    }

    return this.products().filter((item) => {
      const categoryName = this.categoryTitle(item.categoryId).toLowerCase();
      const subcategoryName = this.subcategoryTitle(item.subcategoryId).toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.originCountry.toLowerCase().includes(query) ||
        categoryName.includes(query) ||
        subcategoryName.includes(query)
      );
    });
  });

  async saveCategory(): Promise<void> {
    if (!this.categoryForm.title.trim() || !this.categoryForm.description.trim() || !this.categoryForm.imageUrl.trim()) {
      this.statusMessage.set('Category title, description, and image are required.');
      return;
    }

    const editingId = this.editingCategoryId();
    const result = editingId
      ? await this.adminCatalog.updateCategory(editingId, this.categoryForm)
      : await this.adminCatalog.createCategory(this.categoryForm);

    this.statusMessage.set(result.message);
    this.resetCategoryForm();
  }

  editCategory(category: Category): void {
    this.editingCategoryId.set(category.id);
    this.categoryForm.title = category.title;
    this.categoryForm.description = category.description;
    this.categoryForm.imageUrl = category.imageUrl;
    this.scrollToForms();
  }

  async deleteCategory(category: Category): Promise<void> {
    const confirmed = window.confirm(`Delete category "${category.title}" and all linked subcategories/products?`);
    if (!confirmed) {
      return;
    }

    const result = await this.adminCatalog.deleteCategory(category.id);
    this.statusMessage.set(result.message);
    if (this.editingCategoryId() === category.id) {
      this.resetCategoryForm();
    }
  }

  async saveSubcategory(): Promise<void> {
    if (
      !this.subcategoryForm.categoryId.trim() ||
      !this.subcategoryForm.title.trim() ||
      !this.subcategoryForm.description.trim() ||
      !this.subcategoryForm.imageUrl.trim()
    ) {
      this.statusMessage.set('Subcategory category, title, description, and image are required.');
      return;
    }

    const editingId = this.editingSubcategoryId();
    const result = editingId
      ? await this.adminCatalog.updateSubcategory(editingId, this.subcategoryForm)
      : await this.adminCatalog.createSubcategory(this.subcategoryForm);

    this.statusMessage.set(result.message);
    this.resetSubcategoryForm();
  }

  editSubcategory(subcategory: Subcategory): void {
    this.editingSubcategoryId.set(subcategory.id);
    this.subcategoryForm.categoryId = subcategory.categoryId;
    this.subcategoryForm.title = subcategory.title;
    this.subcategoryForm.description = subcategory.description;
    this.subcategoryForm.imageUrl = subcategory.imageUrl;
    this.scrollToForms();
  }

  async deleteSubcategory(subcategory: Subcategory): Promise<void> {
    const confirmed = window.confirm(`Delete subcategory "${subcategory.title}" and linked products?`);
    if (!confirmed) {
      return;
    }

    const result = await this.adminCatalog.deleteSubcategory(subcategory.id);
    this.statusMessage.set(result.message);
    if (this.editingSubcategoryId() === subcategory.id) {
      this.resetSubcategoryForm();
    }
  }

  async saveProduct(): Promise<void> {
    if (
      !this.productForm.categoryId.trim() ||
      !this.productForm.title.trim() ||
      !this.productForm.description.trim() ||
      !this.productForm.imageUrl.trim() ||
      !this.productForm.originCountry.trim()
    ) {
      this.statusMessage.set('Product category, title, description, image, and origin country are required.');
      return;
    }

    const editingId = this.editingProductId();
    const payload = {
      ...this.productForm,
      subcategoryId: this.productForm.subcategoryId.trim() || undefined
    };
    const result = editingId
      ? await this.adminCatalog.updateProduct(editingId, payload)
      : await this.adminCatalog.createProduct(payload);

    this.statusMessage.set(result.message);
    this.resetProductForm();
  }

  editProduct(product: Product): void {
    this.editingProductId.set(product.id);
    this.productForm.categoryId = product.categoryId;
    this.productForm.subcategoryId = product.subcategoryId ?? '';
    this.productForm.title = product.title;
    this.productForm.description = product.description;
    this.productForm.imageUrl = product.imageUrl;
    this.productForm.originCountry = product.originCountry;
    this.productForm.price = product.price;
    this.scrollToForms();
  }

  async deleteProduct(product: Product): Promise<void> {
    const confirmed = window.confirm(`Delete product "${product.title}"?`);
    if (!confirmed) {
      return;
    }

    const result = await this.adminCatalog.deleteProduct(product.id);
    this.statusMessage.set(result.message);
    if (this.editingProductId() === product.id) {
      this.resetProductForm();
    }
  }

  async uploadAndBindImage(event: Event, type: 'category' | 'subcategory' | 'product'): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    if (!file) {
      return;
    }

    const folder = type === 'category' ? 'categories' : type === 'subcategory' ? 'subcategories' : 'products';

    try {
      const imageUrl = await this.adminCatalog.uploadImage(file, folder);
      if (type === 'category') {
        this.categoryForm.imageUrl = imageUrl;
      } else if (type === 'subcategory') {
        this.subcategoryForm.imageUrl = imageUrl;
      } else {
        this.productForm.imageUrl = imageUrl;
      }
      this.statusMessage.set('Image uploaded successfully.');
    } catch (error) {
      this.statusMessage.set(error instanceof Error ? error.message : 'Image upload failed.');
    }

    input.value = '';
  }

  categoryTitle(categoryId: string): string {
    return this.categories().find((item) => item.id === categoryId)?.title ?? 'Unknown category';
  }

  subcategoryTitle(subcategoryId?: string): string {
    if (!subcategoryId) {
      return 'Not assigned';
    }

    return this.subcategories().find((item) => item.id === subcategoryId)?.title ?? 'Not assigned';
  }

  cancelEdit(type: 'category' | 'subcategory' | 'product'): void {
    if (type === 'category') {
      this.resetCategoryForm();
      return;
    }

    if (type === 'subcategory') {
      this.resetSubcategoryForm();
      return;
    }

    this.resetProductForm();
  }

  private resetCategoryForm(): void {
    this.editingCategoryId.set(null);
    this.categoryForm.title = '';
    this.categoryForm.description = '';
    this.categoryForm.imageUrl = '';
  }

  private resetSubcategoryForm(): void {
    this.editingSubcategoryId.set(null);
    this.subcategoryForm.categoryId = '';
    this.subcategoryForm.title = '';
    this.subcategoryForm.description = '';
    this.subcategoryForm.imageUrl = '';
  }

  private resetProductForm(): void {
    this.editingProductId.set(null);
    this.productForm.categoryId = '';
    this.productForm.subcategoryId = '';
    this.productForm.title = '';
    this.productForm.description = '';
    this.productForm.imageUrl = '';
    this.productForm.originCountry = '';
    this.productForm.price = 0;
  }

  private scrollToForms(): void {
    const forms = document.querySelector('.forms-grid');
    forms?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

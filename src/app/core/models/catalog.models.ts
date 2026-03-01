export interface Category {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  description: string;
}

export type CategoryCreateInput = Omit<Category, 'id' | 'slug'>;
export type CategoryUpdateInput = Partial<Omit<Category, 'id'>> & { title?: string };

export interface Subcategory {
  id: string;
  slug: string;
  categoryId: string;
  title: string;
  imageUrl: string;
  description: string;
}

export type SubcategoryCreateInput = Omit<Subcategory, 'id' | 'slug'>;
export type SubcategoryUpdateInput = Partial<Omit<Subcategory, 'id'>> & { title?: string };

export interface Product {
  id: string;
  slug: string;
  categoryId: string;
  subcategoryId?: string;
  title: string;
  imageUrl: string;
  gallery: string[];
  description: string;
  originCountry: string;
  price: number;
  currency: string;
}

export type ProductCreateInput = Omit<Product, 'id' | 'slug' | 'gallery' | 'currency'>;
export type ProductUpdateInput = Partial<Omit<Product, 'id'>> & {
  title?: string;
  imageUrl?: string;
};

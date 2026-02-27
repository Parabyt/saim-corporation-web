export interface Category {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  description: string;
}

export interface Subcategory {
  id: string;
  slug: string;
  categoryId: string;
  title: string;
  imageUrl: string;
  description: string;
}

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

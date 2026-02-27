import { Category } from '../models/catalog.models';

export const KUMAS_STYLE_CATEGORIES: Omit<Category, 'id'>[] = [
  { slug: 'amerikan-bezi', title: 'Amerikan Bezi Kumaş', imageUrl: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=900&q=80', description: 'Durable cotton base for apparel and utility production.' },
  { slug: 'duck-kumas', title: 'Duck Kumaş', imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80', description: 'Heavyweight canvas-like fabric for bags and upholstery.' },
  { slug: 'dijital-baski-kumas', title: 'Dijital Baskı Kumaş', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80', description: 'High-resolution printed fabric selections.' },
  { slug: 'gabardin-kumas', title: 'Gabardin Kumaş', imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80', description: 'Tightly woven, durable fabric for structured garments.' },
  { slug: 'keten-kumas', title: 'Keten Kumaş', imageUrl: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=900&q=80', description: 'Breathable linen blends for fashion and home textiles.' },
  { slug: 'muslin-bezi-kumas', title: 'Müslin Kumaş', imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80', description: 'Soft muslin options for kids and lifestyle products.' },
  { slug: 'poplin-kumas', title: 'Poplin Kumaş', imageUrl: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=900&q=80', description: 'Smooth plain-weave cotton for shirts and dresses.' },
  { slug: 'pazen-kumas', title: 'Pazen Kumaş', imageUrl: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=900&q=80', description: 'Warm brushed textures for seasonal collections.' },
  { slug: 'penye-kumas', title: 'Penye Kumaş', imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80', description: 'Knitted fabrics with soft touch and stretch comfort.' },
  { slug: 'saten-kumas', title: 'Saten Kumaş', imageUrl: 'https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=900&q=80', description: 'Lustrous satin options for premium garment segments.' },
  { slug: 'viskon-kumas', title: 'Viskon Kumaş', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80', description: 'Fluid drape and rich prints for modern apparel.' },
  { slug: 'welsoft-kumas', title: 'Welsoft Kumaş', imageUrl: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=900&q=80', description: 'Ultra-soft fabrics for home and comfort categories.' }
];

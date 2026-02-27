#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE_URL = 'https://kumas.com';
const COLLECTIONS_URL = `${BASE_URL}/collections.xml`;
const PRODUCTS_URL = `${BASE_URL}/products.xml`;

const outputPathArg = process.argv.find((item) => item.startsWith('--out='));
const assetsOutputPathArg = process.argv.find((item) => item.startsWith('--assets-out='));
const maxProductsArg = process.argv.find((item) => item.startsWith('--max-products='));

const outputPath = resolve(process.cwd(), outputPathArg ? outputPathArg.split('=')[1] : 'data/kumas-seed.json');
const assetsOutputPath = resolve(
  process.cwd(),
  assetsOutputPathArg ? assetsOutputPathArg.split('=')[1] : 'src/assets/seeds/kumas-seed.json'
);
const maxProducts = maxProductsArg ? Number(maxProductsArg.split('=')[1]) : 150;

function parseLocs(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
}

function slugToTitle(slug) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function randomPrice() {
  const min = 3;
  const max = 12;
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

const [collectionsXml, productsXml] = await Promise.all([
  fetch(COLLECTIONS_URL).then((res) => res.text()),
  fetch(PRODUCTS_URL).then((res) => res.text())
]);

const collectionLocs = parseLocs(collectionsXml);
const productLocs = parseLocs(productsXml);

const categoryMap = new Map();
const categories = [];
for (const loc of collectionLocs) {
  const slug = loc.replace(`${BASE_URL}/`, '').trim();
  if (!slug || categoryMap.has(slug)) {
    continue;
  }

  const id = `cat-${categories.length + 1}`;
  categoryMap.set(slug, id);

  categories.push({
    id,
    slug,
    title: slugToTitle(slug),
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    description: `${slugToTitle(slug)} collection imported from Kumas sitemap.`
  });
}

const products = [];
for (const loc of productLocs.slice(0, maxProducts)) {
  const slug = loc.replace(`${BASE_URL}/`, '').trim();
  if (!slug) {
    continue;
  }

  const category = categories[products.length % Math.max(categories.length, 1)];
  if (!category) {
    continue;
  }

  products.push({
    id: `prd-${products.length + 1}`,
    slug,
    categoryId: category.id,
    title: slugToTitle(slug),
    imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
    gallery: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'],
    description: `${slugToTitle(slug)} product imported from Kumas sitemap.`,
    originCountry: 'Turkey',
    price: randomPrice(),
    currency: 'USD'
  });
}

const output = {
  source: {
    date: new Date().toISOString(),
    collectionsUrl: COLLECTIONS_URL,
    productsUrl: PRODUCTS_URL
  },
  categories,
  products
};

const payload = JSON.stringify(output, null, 2);
writeFileSync(outputPath, payload);
writeFileSync(assetsOutputPath, payload);

console.log(`Generated ${categories.length} categories and ${products.length} products.`);
console.log(`Saved data: ${outputPath}`);
console.log(`Saved assets: ${assetsOutputPath}`);

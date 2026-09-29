// Export existing checked-in defaults; no Firebase connection or writes.
const ts = require('typescript');
const fs = require('fs');
const vm = require('vm');
function read(path) {
  const js = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const context = { exports: {} }; vm.runInNewContext(js, context); return context.exports;
}
const { NICHE_CATEGORIES, NICHE_SUBCATEGORY_SEEDS, NICHE_PRODUCT_SEEDS } = read('src/app/core/data/niche-catalog.data.ts');
const { DEFAULT_HOME_CONTENT: home, DEFAULT_COMPANY_PROFILE: company } = read('src/app/core/data/default-content.ts');
const categories = NICHE_CATEGORIES.map((v,i) => ({ ...v, id: `cat-seed-${i+1}` }));
const subcategories = NICHE_SUBCATEGORY_SEEDS.map((v,i) => ({ id: `sub-seed-${i+1}`, slug: v.slug, title: v.title, description: v.description, imageUrl: v.imageUrl, categoryId: categories.find(c => c.slug === v.categorySlug).id }));
const products = NICHE_PRODUCT_SEEDS.map((v,i) => {
  const categoryId = categories.find(c => c.slug === v.categorySlug).id;
  return { id: `prd-seed-${i+1}`, slug: v.title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'), title: v.title, description: v.description, imageUrl: v.imageUrl, gallery: [v.imageUrl], categoryId, subcategoryId: subcategories.find(s => s.categoryId === categoryId && s.slug === v.subcategorySlug)?.id, originCountry: v.originCountry, price: v.price, currency: 'USD' };
});
fs.writeFileSync('backend/seed.json', JSON.stringify({ categories, subcategories, products, home, company }, null, 2)+'\n');

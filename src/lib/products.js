const { prisma } = require('./db');
const { finalPrice } = require('./format');

function serializeProduct(p) {
  return {
    ...p,
    image: p.images?.[0]?.url || null,
    finalPrice: finalPrice(p.price, p.discount),
    specs: p.specs ? JSON.parse(p.specs) : [],
    options: p.options ? JSON.parse(p.options) : []
  };
}

async function getAllProducts(categorySlug) {
  const products = await prisma.product.findMany({
    where: categorySlug && categorySlug !== 'all' ? { category: { slug: categorySlug } } : {},
    include: { images: true, category: true },
    orderBy: { createdAt: 'desc' }
  });
  return products.map(serializeProduct);
}

async function getTopDiscountProducts(limit = 10) {
  const products = await prisma.product.findMany({
    include: { images: true, category: true },
    orderBy: { discount: 'desc' },
    take: limit
  });
  return products.map(serializeProduct);
}

async function getLatestProducts(limit = 10) {
  const products = await prisma.product.findMany({
    include: { images: true, category: true },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
  return products.map(serializeProduct);
}

async function getProductBySlug(slug) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: true, category: true }
  });
  if (!product) return null;
  return serializeProduct(product);
}

async function getRelatedProducts(product, limit = 4) {
  let related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    include: { images: true, category: true },
    take: limit
  });
  if (related.length < 3) {
    related = await prisma.product.findMany({
      where: { id: { not: product.id } },
      include: { images: true, category: true },
      take: limit
    });
  }
  return related.map(serializeProduct);
}

async function getAllCategories() {
  return prisma.category.findMany({ orderBy: { label: 'asc' } });
}

module.exports = {
  serializeProduct,
  getAllProducts,
  getTopDiscountProducts,
  getLatestProducts,
  getProductBySlug,
  getRelatedProducts,
  getAllCategories
};

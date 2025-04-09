import { connect } from 'mongoose';
import { Product, ProductSchema } from '../src/products/schemas/product.schema';
import { Category, CategorySchema } from '../src/categories/schemas/category.schema';
import { Order, OrderSchema } from '../src/orders/schemas/order.schema';

async function seed() {
  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/some-db';
  const conn = await connect(mongoUrl);
  const productModel = conn.model(Product.name, ProductSchema);
  const categoryModel = conn.model(Category.name, CategorySchema);
  const orderModel = conn.model(Order.name, OrderSchema);

  const categories = await categoryModel.insertMany([
    { name: 'electronic' },
    { name: 'home' },
    { name: 'kitchen' },
    { name: 'fashion' },
    { name: 'beauty' },
    { name: 'personal' },
    { name: 'care' },
    { name: 'health' },
    { name: 'sports' },
    { name: 'outdoor' },
    { name: 'toys' },
    { name: 'game' },
    { name: 'automotive' },
    { name: 'bookstationery' },
    { name: 'food' },
    { name: 'pet' },
    { name: 'supplies' },
    { name: 'office' },
    { name: 'jewelry' },
    { name: 'watch' },
    { name: 'music' },
    { name: 'instrument' },
    { name: 'baby' },
    { name: 'maternity' },
    { name: 'diy' },
    { name: 'garden' },
    { name: 'industrial' },
    { name: 'scientific' },
    { name: 'furniture' },
    { name: 'art' },
    { name: 'collectible' },
    { name: 'security' },
    { name: 'device' }
  ]);

  const products = await productModel.insertMany([
    { name: 'Product01', price: 450, categoryIds: [categories[0]._id] },
    { name: 'Product02', price: 29, categoryIds: [categories[1]._id] },
    { name: 'Product03', price: 15.4, categoryIds: [categories[0]._id, categories[2]._id] },
    { name: 'Product04', price: 57.99, categoryIds: [categories[3]._id] },
    { name: 'Product05', price: 12.21, categoryIds: [categories[4]._id, categories[1]._id, categories[15]._id] },
    { name: 'Product06', price: 765, categoryIds: [categories[5]._id] },
    { name: 'Product07', price: 78, categoryIds: [categories[16]._id] },
    { name: 'Product08', price: 11, categoryIds: [categories[7]._id, categories[21]._id] },
    { name: 'Product09', price: 0.95, categoryIds: [categories[8]._id] },
    { name: 'Product10', price: 16, categoryIds: [categories[25]._id] },
  ]);

  await orderModel.insertMany([
    { productIds: [products[0]._id], total: products[0].price },
    { productIds: [products[1]._id], total: 29 },
    { productIds: [products[2]._id, products[1]._id], total: products[2].price + products[1].price },
    { productIds: [products[3]._id, products[6]._id], total: products[3].price + products[6].price },
    { productIds: [products[5]._id], total:  products[5].price },
    { productIds: [products[6]._id], total: products[6].price },
    { productIds: [products[7]._id], total: products[7].price },
    { productIds: [products[8]._id], total: products[8].price },
    { productIds: [products[9]._id], total: products[9].price },
    { productIds: [products[0]._id, products[1]._id], total: products[0].price + products[1].price },
    { productIds: [products[2]._id, products[3]._id], total: products[2].price + products[3].price },
    { productIds: [products[4]._id, products[5]._id], total: products[4].price + products[5].price },
    { productIds: [products[6]._id, products[7]._id], total: products[6].price + products[7].price },
    { productIds: [products[8]._id, products[9]._id], total: products[8].price + products[9].price }
  ]);

  console.log('data inserted');
  await conn.disconnect();
}

seed().catch(console.error);
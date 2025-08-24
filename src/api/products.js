// Simple product API backed by a local JSON file
import products from "../data/products.json";

export function listProducts(filter = {}) {
  return products.filter(p => !filter.category || p.category === filter.category);
}

export function getProduct(id) {
  return products.find(p => p.id === id);
}

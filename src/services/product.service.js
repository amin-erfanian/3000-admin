import http from '@/libs/http';

export const getProductList = (params) => {
  return http.get('/admin/products', { params });
};

export const getProduct = (productId) => {
  return http.get(`/admin/products/${productId}`);
};

export const getSellerProductList = (params) => {
  return http.get('/products/seller', { params });
};

export const createProduct = (payload) => {
  return http.post('/products/create', payload);
};

export const approveProduct = (productId) => {
  return http.post(`/admin/products/${productId}/approve`, {});
};

export const rejectProduct = (productId, payload) => {
  return http.post(`/admin/products/${productId}/reject`, payload);
};

export default {
  getProductList,
  getProduct,
  createProduct,
  approveProduct,
  rejectProduct,
};

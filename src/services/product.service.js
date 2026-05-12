import http from '@/libs/http';

export const getProductList = (params) => {
  return http.get('/admin/products', { params });
};

export const getSellerProductList = (params) => {
  return http.get('/products/seller', { params });
};

export const createProduct = (payload) => {
  return http.post('/products/create', payload);
};

export default {
  getProductList,
  createProduct,
};

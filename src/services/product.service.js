import http from '@/libs/http';

export const getProductList = (params) => {
  return http.get('/admin/products', { params });
};

export const getProduct = (productId) => {
  return http.get(`/admin/products/${productId}`);
};

export const getProductVariants = (productId) => {
  return http.get(`/admin/products/${productId}/variants`);
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

export const deleteProduct = (productId) => {
  return http.delete(`/admin/products/${productId}`);
};

export const getReferencePriceRequests = (params) => {
  return http.get('/admin/products/reference-price-requests', { params });
};

export const updateReferencePrice = (productId, referencePrice) => {
  return http.put(`/admin/products/${productId}/reference-price`, {
    referencePrice,
  });
};

export const markReferencePriceRequestsWatched = (productId, requestIds) => {
  return http.patch(
    `/admin/products/${productId}/reference-price-requests/watched`,
    { requestIds },
  );
};

export default {
  getProductList,
  getProduct,
  getProductVariants,
  createProduct,
  approveProduct,
  rejectProduct,
  deleteProduct,
  getReferencePriceRequests,
  updateReferencePrice,
  markReferencePriceRequestsWatched,
};

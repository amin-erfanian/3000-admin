import http from '@/libs/http';

export const getAttributes = () => {
  return http.get('/admin/attributes');
};

export const createAttribute = (data) => {
  return http.post('/admin/attributes', data);
};

export const createAttributesBatch = (attributes) => {
  return http.post('/admin/attributes/batch', { attributes });
};

export const updateAttribute = (id, data) => {
  return http.put(`/admin/attributes/${id}`, data);
};

export const attachCategoryAttributes = (categoryId, attributeIds) => {
  return http.post(`/admin/attributes/category/${categoryId}`, {
    attributeIds,
  });
};

export const removeCategoryAttribute = (categoryId, attributeId) => {
  return http.delete(`/admin/attributes/category/${categoryId}/${attributeId}`);
};

export const getHeaders = () => {
  return http.get('/admin/attributes/headers');
};

export default {
  getAttributes,
  createAttribute,
  createAttributesBatch,
  updateAttribute,
  attachCategoryAttributes,
  removeCategoryAttribute,
  getHeaders,
};

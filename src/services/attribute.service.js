import http from '@/libs/http';

export const getAttributes = () => {
  return http.get('/admin/attributes');
};

export const createAttribute = (data) => {
  return http.post('/admin/attributes', data);
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

export default {
  getAttributes,
  createAttribute,
  updateAttribute,
  attachCategoryAttributes,
  removeCategoryAttribute,
};

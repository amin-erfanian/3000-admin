import http from '@/libs/http';

export async function getCategoryTree() {
  return http.get('/categories/tree');
}

export async function getCategory(id) {
  return http.get(`/categories/${id}`);
}

export async function createCategory(data) {
  return http.post('/categories', data);
}

export async function updateCategory(id, data) {
  return http.put(`/categories/${id}`, data);
}

export async function replaceCategoryAttributes(id, attributes) {
  return http.put(`/categories/${id}/attributes`, { attributes });
}

export async function deleteCategory(id) {
  return http.delete(`/categories/${id}`);
}

export default {
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  replaceCategoryAttributes,
  deleteCategory,
};

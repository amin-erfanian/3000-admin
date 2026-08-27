import http from '@/libs/http';

export async function getCategoryTree() {
  const categories = await http.get('/categories/tree');
  const nodesById = new Map();
  for (const category of categories) {
    nodesById.set(category._id, {
      ...category,
      children: [],
    });
  }

  const roots = [];

  for (const node of nodesById.values()) {
    const parentId =
      typeof node.parent === 'object' ? node.parent?._id : node.parent;

    if (!parentId) {
      roots.push(node);
      continue;
    }

    const parent = nodesById.get(parentId);

    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function getCategory(id) {
  return http.get(`/categories/${id}`);
}

export async function createCategory(data) {
  return http.post('/admin/categories', data);
}

export async function updateCategory(id, data) {
  return http.put(`/admin/categories/${id}`, data);
}

export async function replaceCategoryAttributes(id, attributes) {
  return http.put(`/admin/categories/${id}/attributes`, { attributes });
}

export async function deleteCategory(id) {
  return http.delete(`/admin/categories/${id}`);
}

export default {
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  replaceCategoryAttributes,
  deleteCategory,
};

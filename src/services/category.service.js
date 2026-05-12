import http from '@/libs/http';

export async function getCategoryTree() {
  return http.get('/categories/tree');
}

export default {
  getCategoryTree,
};

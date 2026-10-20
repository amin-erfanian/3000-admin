import http from '@/libs/http';

export const createVariant = (payload) => {
  return http.post('/variants/create', payload);
};

export const deleteVariant = (variantId) => {
  return http.delete(`/admin/variants/${variantId}`);
};

export default {
  createVariant,
  deleteVariant,
};

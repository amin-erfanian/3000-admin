import http from '@/libs/http';

export const createVariant = (payload) => {
  return http.post('/variants/create', payload);
};

export default {
  createVariant,
};

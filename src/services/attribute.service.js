import http from '@/libs/http';

export const getAttributes = () => {
  return http.get('/admin/attributes');
};

export default {
  getAttributes,
};

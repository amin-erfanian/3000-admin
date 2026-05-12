import http from '@/libs/http';

export const signIn = ({ phone, password }) => {
  return http.post('/auth/admin/sign-in', { phone, password });
};

export default {
  signIn,
};

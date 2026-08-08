import http from '@/libs/http';

export const signIn = ({ phone, password }) => {
  return http.post('/admin/auth/sign-in', { phone, password });
};

export default {
  signIn,
};

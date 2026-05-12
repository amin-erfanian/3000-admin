import http from '@/libs/http';

export async function getBrands() {
  return http.get('/brands');
}

export default {
  getBrands,
};

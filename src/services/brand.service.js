import http from '@/libs/http';

export const getBrands = () => {
  return http.get(`/brands`, { params: { status: 'pending' } });
};

export const approveBrand = (brandId) => {
  return http.post(`/brands/${brandId}/approve`, {});
};

export const rejectBrand = (brandId, payload) => {
  return http.post(`/brands/${brandId}/reject`, payload);
};

export default {
  getBrands,
  approveBrand,
  rejectBrand,
};

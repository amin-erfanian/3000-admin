import http from '@/libs/http';

export const getWarranties = (params) => {
  return http.get('/admin/warranties', { params });
};

export const approveWarranty = (warrantyId) => {
  return http.post(`/admin/warranties/${warrantyId}/approve`, {});
};

export const rejectWarranty = (warrantyId) => {
  return http.post(`/admin/warranties/${warrantyId}/reject`, {});
};

export default {
  getWarranties,
  approveWarranty,
  rejectWarranty,
};

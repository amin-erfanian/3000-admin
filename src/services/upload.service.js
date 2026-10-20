import http from '@/libs/http';

export const uploadFile = (payload) => {
  return http.post('/admin/storage/upload', payload, {
    headers: { 'Content-Type': undefined },
  });
};

export default {
  uploadFile,
};

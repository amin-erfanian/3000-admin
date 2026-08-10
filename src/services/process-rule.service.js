import http from '@/libs/http';

export async function getProcessRules() {
  return http.get('/process-rules');
}

export async function addProcessRule(payload) {
  return http.post('/admin/process-rules', payload);
}

export default {
  getProcessRules,
  addProcessRule,
};

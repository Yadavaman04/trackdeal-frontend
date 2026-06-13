import apiClient from '@/api/client';

export async function fetchCommissions(params) {
  const response = await apiClient.get('/commissions', { params });
  return response.data;
}

export async function fetchCommissionById(id) {
  const response = await apiClient.get(`/commissions/${id}`);
  return response.data;
}

export async function createCommission(data) {
  const response = await apiClient.post('/commissions', data);
  return response.data;
}

export async function createInvoice({ id, ...data }) {
  const response = await apiClient.post(`/commissions/${id}/invoice`, data);
  return response.data;
}

export async function recordCollection({ invoiceId, ...data }) {
  const response = await apiClient.post(`/commissions/invoices/${invoiceId}/collection`, data);
  return response.data;
}

export async function releasePayout(payoutId) {
  const response = await apiClient.post(`/commissions/payouts/${payoutId}/release`);
  return response.data;
}

export async function processClawback({ id, ...data }) {
  const response = await apiClient.post(`/commissions/${id}/clawback`, data);
  return response.data;
}

export async function transitionStage({ id, stage, notes }) {
  const response = await apiClient.post(`/commissions/${id}/transition`, { stage, notes });
  return response.data;
}

export async function clearCollection(collectionId) {
  const response = await apiClient.post(`/commissions/collections/${collectionId}/clear`);
  return response.data;
}

export async function bounceCollection(collectionId) {
  const response = await apiClient.post(`/commissions/collections/${collectionId}/bounce`);
  return response.data;
}

export default {
  fetchCommissions,
  fetchCommissionById,
  createCommission,
  createInvoice,
  recordCollection,
  releasePayout,
  processClawback,
  transitionStage,
  clearCollection,
  bounceCollection
};

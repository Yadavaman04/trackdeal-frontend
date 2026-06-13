import apiClient from '@/api/client';

export async function fetchDeals(params) {
  const response = await apiClient.get('/deals', { params });
  return response.data;
}

export async function fetchDealById(id) {
  const response = await apiClient.get(`/deals/${id}`);
  return response.data;
}

export async function createDeal(data) {
  const response = await apiClient.post('/deals', data);
  return response.data;
}

export async function addOffer({ id, ...data }) {
  const response = await apiClient.post(`/deals/${id}/offer`, data);
  return response.data;
}

export async function extendReservation({ id, lockedDurationMinutes }) {
  const response = await apiClient.post(`/deals/${id}/reserve/extend`, { lockedDurationMinutes });
  return response.data;
}

export async function releaseReservation(id) {
  const response = await apiClient.post(`/deals/${id}/reserve/release`);
  return response.data;
}

export async function convertReservation(id) {
  const response = await apiClient.post(`/deals/${id}/reserve/convert`);
  return response.data;
}

export async function addPayment({ id, ...data }) {
  const response = await apiClient.post(`/deals/${id}/payment`, data);
  return response.data;
}

export async function addRefund({ id, ...data }) {
  const response = await apiClient.post(`/deals/${id}/refund`, data);
  return response.data;
}

export async function uploadDocument({ id, docType, fileId }) {
  const response = await apiClient.post(`/deals/${id}/document`, { docType, fileId });
  return response.data;
}

export async function verifyDocument({ id, docType }) {
  const response = await apiClient.post(`/deals/${id}/verify`, { docType });
  return response.data;
}

export async function transitionStage({ id, stage, cancellationReason }) {
  const body = { status: stage };
  if (cancellationReason) body.cancellationReason = cancellationReason;
  const response = await apiClient.post(`/deals/${id}/transition`, body);
  return response.data;
}

export default {
  fetchDeals,
  fetchDealById,
  createDeal,
  addOffer,
  extendReservation,
  releaseReservation,
  convertReservation,
  addPayment,
  addRefund,
  uploadDocument,
  verifyDocument,
  transitionStage
};

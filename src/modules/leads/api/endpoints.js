import apiClient from '@/api/client';

export async function fetchLeads(params) {
  const response = await apiClient.get('/leads', { params });
  return response.data;
}

export async function fetchLeadById(id) {
  const response = await apiClient.get(`/leads/${id}`);
  return response.data;
}

export async function createLead(data) {
  const response = await apiClient.post('/leads', data);
  return response.data;
}

export async function updateLead({ id, ...data }) {
  const response = await apiClient.put(`/leads/${id}`, data);
  return response.data;
}

export async function deleteLead(id) {
  const response = await apiClient.delete(`/leads/${id}`);
  return response.data;
}

export async function assignLead({ id, assignedTo, reason }) {
  const response = await apiClient.post(`/leads/${id}/assign`, { assignedTo, reason });
  return response.data;
}

export async function bulkAssignLeads({ leadIds, assignedTo, reason }) {
  const response = await apiClient.post('/leads/bulk-assign', { leadIds, assignedTo, reason });
  return response.data;
}

export async function changeLeadStage({ id, status, lostReason, lostNotes }) {
  const response = await apiClient.post(`/leads/${id}/stage`, { status, lostReason, lostNotes });
  return response.data;
}

export async function addLeadNote({ id, content, isPrivate }) {
  const response = await apiClient.post(`/leads/${id}/notes`, { content, isPrivate });
  return response.data;
}

export async function logLeadActivity({ id, type, description, metadata }) {
  const response = await apiClient.post(`/leads/${id}/activities`, { type, description, metadata });
  return response.data;
}

export async function addLeadFollowUp({ id, scheduledAt, type, notes, assignedTo }) {
  const response = await apiClient.post(`/leads/${id}/follow-up`, { scheduledAt, type, notes, assignedTo });
  return response.data;
}

export async function reopenLead(id) {
  const response = await apiClient.post(`/leads/${id}/reopen`);
  return response.data;
}

export async function markLeadWon(id) {
  const response = await apiClient.post(`/leads/${id}/won`);
  return response.data;
}

export async function markLeadLost({ id, reason }) {
  const response = await apiClient.post(`/leads/${id}/lost`, { reason });
  return response.data;
}

export default {
  fetchLeads,
  fetchLeadById,
  createLead,
  updateLead,
  deleteLead,
  assignLead,
  bulkAssignLeads,
  changeLeadStage,
  addLeadNote,
  logLeadActivity,
  addLeadFollowUp,
  reopenLead,
  markLeadWon,
  markLeadLost
};

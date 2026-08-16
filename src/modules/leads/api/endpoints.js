import apiClient from '@/api/client';

export async function fetchLeads(params) {
  const response = await apiClient.get('/leads', { params });
  return response.data;
}

export async function fetchLeadById(id) {
  const cleanId = typeof id === 'object' && id !== null && 'value' in id ? id.value : id;
  const response = await apiClient.get(`/leads/${cleanId}`);
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

// ---------------------------------------------------------------------------
// Activity Center APIs
// ---------------------------------------------------------------------------

export async function fetchActivityCenter(leadId) {
  const response = await apiClient.get(`/leads/${leadId}/activity-center`);
  return response.data;
}

export async function createVisit(leadId, data) {
  const response = await apiClient.post(`/leads/${leadId}/visits`, data);
  return response.data;
}

export async function fetchVisits(leadId) {
  const response = await apiClient.get(`/leads/${leadId}/visits`);
  return response.data;
}

export async function createQuotation(leadId, data) {
  const response = await apiClient.post(`/leads/${leadId}/quotations`, data);
  return response.data;
}

export async function fetchQuotations(leadId) {
  const response = await apiClient.get(`/leads/${leadId}/quotations`);
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
  markLeadLost,
  fetchActivityCenter,
  createVisit,
  fetchVisits,
  createQuotation,
  fetchQuotations,
};


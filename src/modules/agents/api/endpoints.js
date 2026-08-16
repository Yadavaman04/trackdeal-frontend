import apiClient from '@/api/client';

export async function fetchAgents(params) {
  const response = await apiClient.get('/agents', { params });
  return response.data;
}

export async function fetchActiveAgents() {
  const response = await apiClient.get('/agents/active');
  return response.data;
}

export async function fetchAgentById(id) {
  const cleanId = typeof id === 'object' && id !== null && 'value' in id ? id.value : id;
  const response = await apiClient.get(`/agents/${cleanId}`);
  return response.data;
}

export async function fetchAgentLeads(id, params) {
  const cleanId = typeof id === 'object' && id !== null && 'value' in id ? id.value : id;
  const response = await apiClient.get(`/agents/${cleanId}/leads`, { params });
  return response.data;
}

export async function createAgent(data) {
  const response = await apiClient.post('/agents', data);
  return response.data;
}

export async function updateAgent({ id, ...data }) {
  const response = await apiClient.put(`/agents/${id}`, data);
  return response.data;
}

export async function updateAgentStatus({ id, status }) {
  const response = await apiClient.patch(`/agents/${id}/status`, { status });
  return response.data;
}

export async function deleteAgent(id) {
  const response = await apiClient.delete(`/agents/${id}`);
  return response.data;
}

export async function transferLeadToAgent({ leadId, agentId, remarks }) {
  const response = await apiClient.post(`/leads/${leadId}/transfer-agent`, { agentId, remarks });
  return response.data;
}

const agentsApi = {
  fetchAgents,
  fetchActiveAgents,
  fetchAgentById,
  fetchAgentLeads,
  createAgent,
  updateAgent,
  updateAgentStatus,
  deleteAgent,
  transferLeadToAgent,
};

export default agentsApi;

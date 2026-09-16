import apiClient from '@/api/client';

export async function fetchAdminDashboard() {
  const res = await apiClient.get('/admin/dashboard');
  return res.data;
}

export async function fetchAdminOrganizations(params = {}) {
  const res = await apiClient.get('/admin/organizations', { params });
  return res.data;
}

export async function createAdminOrganization(data) {
  const res = await apiClient.post('/admin/organizations', data);
  return res.data;
}

export async function fetchAdminOrganizationById(id) {
  const res = await apiClient.get(`/admin/organizations/${id}`);
  return res.data;
}

export async function updateAdminOrganization(id, data) {
  const res = await apiClient.put(`/admin/organizations/${id}`, data);
  return res.data;
}

export async function fetchAdminOrganizationUsers(id, params = {}) {
  const res = await apiClient.get(`/admin/organizations/${id}/users`, { params });
  return res.data;
}

export async function resetAdminOwnerPassword(id, password) {
  const res = await apiClient.post(`/admin/organizations/${id}/reset-owner-password`, { password });
  return res.data;
}

export async function fetchAdminUsers(params = {}) {
  const res = await apiClient.get('/admin/users', { params });
  return res.data;
}

export async function createAdminUser(data) {
  const res = await apiClient.post('/admin/users', data);
  return res.data;
}

export async function updateAdminUser(id, data) {
  const res = await apiClient.put(`/admin/users/${id}`, data);
  return res.data;
}

export async function moveAdminUserOrganization(id, organizationId) {
  const res = await apiClient.put(`/admin/users/${id}/move-organization`, { organizationId });
  return res.data;
}

export async function fetchAdminAuditLogs(params = {}) {
  const res = await apiClient.get('/admin/audit-logs', { params });
  return res.data;
}

export async function searchAdminGlobal(q) {
  const res = await apiClient.get('/admin/search', { params: { q } });
  return res.data;
}

export async function fetchTenants(params = {}) {
  const res = await apiClient.get('/tenants', { params });
  return res.data;
}

export async function fetchTenantModules(vertical) {
  const res = await apiClient.get('/tenants/modules', { params: vertical ? { vertical } : {} });
  return res.data;
}

export async function createTenant(data) {
  const res = await apiClient.post('/tenants', data);
  return res.data;
}

export async function updateTenant(id, data) {
  const res = await apiClient.put(`/tenants/${id}`, data);
  return res.data;
}

export async function suspendTenant(id) {
  const res = await apiClient.post(`/tenants/${id}/suspend`);
  return res.data;
}

export async function activateTenant(id) {
  const res = await apiClient.post(`/tenants/${id}/activate`);
  return res.data;
}

export async function fetchTenantById(id) {
  const res = await apiClient.get(`/tenants/${id}`);
  return res.data;
}

import apiClient from '@/api/client';

// Map dashboard role names to the correct analytics API endpoint paths
const roleToEndpoint = {
  'super_admin': 'executive',
  'org_admin':   'executive',
  'finance':     'commission',
  'branch_manager': 'sales',
  'team_leader': 'leads',
  'agent':       'agents',
};

export async function fetchDashboardMetrics({ role, startDate, endDate, branchId }) {
  // Resolve the correct analytics sub-route based on the user's dashboard role
  const endpoint = roleToEndpoint[role] || 'executive';
  const params = { startDate, endDate, branchId };

  const response = await apiClient.get(`/analytics/${endpoint}`, { params });
  return response.data;
}

export default {
  fetchDashboardMetrics
};

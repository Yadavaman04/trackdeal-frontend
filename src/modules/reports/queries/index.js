import { useQuery, useMutation } from '@tanstack/vue-query';
import reportsApi from '../api/endpoints';

export function useLeadAnalyticsQuery(filters) {
  return useQuery({
    queryKey: ['analytics', 'leads', filters],
    queryFn: () => reportsApi.fetchLeadAnalytics(filters),
    placeholderData: (previousData) => previousData
  });
}

export function useSalesAnalyticsQuery(filters) {
  return useQuery({
    queryKey: ['analytics', 'sales', filters],
    queryFn: () => reportsApi.fetchSalesAnalytics(filters),
    placeholderData: (previousData) => previousData
  });
}

export function useCommissionAnalyticsQuery(filters) {
  return useQuery({
    queryKey: ['analytics', 'commission', filters],
    queryFn: () => reportsApi.fetchCommissionAnalytics(filters),
    placeholderData: (previousData) => previousData
  });
}

export function useTaskAnalyticsQuery(filters) {
  return useQuery({
    queryKey: ['analytics', 'tasks', filters],
    queryFn: () => reportsApi.fetchTaskAnalytics(filters),
    placeholderData: (previousData) => previousData
  });
}

export function useExecutiveSummaryQuery(filters) {
  return useQuery({
    queryKey: ['analytics', 'executive', filters],
    queryFn: () => reportsApi.fetchExecutiveSummary(filters),
    placeholderData: (previousData) => previousData
  });
}

export function useAgentPerformanceQuery(filters) {
  return useQuery({
    queryKey: ['analytics', 'agents', filters],
    queryFn: () => reportsApi.fetchAgentPerformance(filters),
    placeholderData: (previousData) => previousData
  });
}

export function useEnqueueExportMutation() {
  return useMutation({
    mutationFn: reportsApi.enqueueExport
  });
}

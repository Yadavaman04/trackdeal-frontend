import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';
import dashboardApi from '../api/endpoints';

export function useDashboardMetricsQuery(role, filters) {
  return useQuery({
    queryKey: computed(() => ['dashboards', 'metrics', { role: unref(role), ...unref(filters) }]),
    queryFn: () => dashboardApi.fetchDashboardMetrics({ role: unref(role), ...unref(filters) }),
    enabled: computed(() => !!unref(role)),
    refetchInterval: 300000 // 5 minutes background refetch
  });
}

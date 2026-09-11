import { unref, computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import agentsApi from '../api/endpoints';

export function useAgentsQuery(filters) {
  return useQuery({
    queryKey: ['agents', filters],
    queryFn: () => agentsApi.fetchAgents(unref(filters)),
    placeholderData: (previousData) => previousData,
  });
}

export function useActiveAgentsQuery() {
  return useQuery({
    queryKey: ['agents', 'active'],
    queryFn: () => agentsApi.fetchActiveAgents(),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useAgentQuery(id) {
  return useQuery({
    queryKey: ['agents', id],
    queryFn: () => agentsApi.fetchAgentById(unref(id)),
    enabled: computed(() => !!unref(id)),
  });
}

export function useAgentLeadsQuery(id, params) {
  return useQuery({
    queryKey: ['agents', id, 'leads', params],
    queryFn: () => agentsApi.fetchAgentLeads(unref(id), unref(params)),
    enabled: computed(() => !!unref(id)),
  });
}

export function useCreateAgentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: agentsApi.createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useUpdateAgentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: agentsApi.updateAgent,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agents', variables.id] });
    },
  });
}

export function useAgentStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: agentsApi.updateAgentStatus,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agents', variables.id] });
    },
  });
}

export function useDeleteAgentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: agentsApi.deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useTransferLeadToAgentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: agentsApi.transferLeadToAgent,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

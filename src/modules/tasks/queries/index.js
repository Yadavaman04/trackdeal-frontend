import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import tasksApi from '../api/endpoints';

export function useTasksQuery(filters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksApi.fetchTasks(filters),
    placeholderData: (previousData) => previousData
  });
}

export function useTaskQuery(id) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.fetchTaskById(id),
    enabled: !!id
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // Invalidate leads queries to refresh follow-ups & SLA badges
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.updateTask,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
}

export function useCompleteTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.completeTask,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
}

export function useCancelTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.cancelTask,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
}

export function useBulkAssignTasksMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.bulkAssignTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
}

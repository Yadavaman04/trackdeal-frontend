import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import propertiesApi from '../api/endpoints';

// ============================================================================
// PROPERTIES QUERY HOOKS
// ============================================================================

export function usePropertiesQuery(filters) {
  return useQuery({
    queryKey: ['properties', 'list', filters],
    queryFn: () => propertiesApi.fetchProperties(filters),
    placeholderData: (previousData) => previousData
  });
}

export function usePropertyQuery(id) {
  return useQuery({
    queryKey: ['properties', 'details', id],
    queryFn: () => propertiesApi.fetchPropertyById(id),
    enabled: !!id
  });
}

export function useCreatePropertyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    }
  });
}

export function useUpdatePropertyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.updateProperty,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties', 'details', variables.id] });
    }
  });
}

export function useDeletePropertyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    }
  });
}

export function useMarkPropertyReservedMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.markPropertyReserved,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties', 'details', variables] });
    }
  });
}

export function useMarkPropertySoldMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.markPropertySold,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties', 'details', variables] });
    }
  });
}

// ============================================================================
// BUILDERS QUERY HOOKS
// ============================================================================

export function useBuildersQuery(filters) {
  return useQuery({
    queryKey: ['builders', 'list', filters],
    queryFn: () => propertiesApi.fetchBuilders(filters),
    placeholderData: (previousData) => previousData
  });
}

export function useBuilderQuery(id) {
  return useQuery({
    queryKey: ['builders', 'details', id],
    queryFn: () => propertiesApi.fetchBuilderById(id),
    enabled: !!id
  });
}

export function useCreateBuilderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.createBuilder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builders'] });
    }
  });
}

export function useUpdateBuilderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.updateBuilder,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['builders'] });
      queryClient.invalidateQueries({ queryKey: ['builders', 'details', variables.id] });
    }
  });
}

export function useDeleteBuilderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.deleteBuilder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builders'] });
    }
  });
}

// ============================================================================
// PROJECTS QUERY HOOKS
// ============================================================================

export function useProjectsQuery(filters) {
  return useQuery({
    queryKey: ['projects', 'list', filters],
    queryFn: () => propertiesApi.fetchProjects(filters),
    placeholderData: (previousData) => previousData
  });
}

export function useProjectQuery(id) {
  return useQuery({
    queryKey: ['projects', 'details', id],
    queryFn: () => propertiesApi.fetchProjectById(id),
    enabled: !!id
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.updateProject,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'details', variables.id] });
    }
  });
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}

// ============================================================================
// AMENITIES QUERY HOOKS
// ============================================================================

export function useAmenitiesQuery(filters) {
  return useQuery({
    queryKey: ['amenities', 'list', filters],
    queryFn: () => propertiesApi.fetchAmenities(filters),
    placeholderData: (previousData) => previousData
  });
}

// ============================================================================
// TOWERS QUERY HOOKS
// ============================================================================

export function useTowersQuery(filters) {
  return useQuery({
    queryKey: ['towers', 'list', filters],
    queryFn: () => propertiesApi.fetchTowers(filters),
    placeholderData: (previousData) => previousData
  });
}

export function useCreateTowerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.createTower,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['towers'] });
    }
  });
}

export function useUpdateTowerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.updateTower,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['towers'] });
      queryClient.invalidateQueries({ queryKey: ['towers', variables.id] });
    }
  });
}

// ============================================================================
// UNITS QUERY HOOKS
// ============================================================================

export function useUnitsQuery(filters) {
  return useQuery({
    queryKey: ['units', 'list', filters],
    queryFn: () => propertiesApi.fetchUnits(filters),
    placeholderData: (previousData) => previousData
  });
}

export function useUnitQuery(id) {
  return useQuery({
    queryKey: ['units', 'details', id],
    queryFn: () => propertiesApi.fetchUnitById(id),
    enabled: !!id
  });
}

export function useCreateUnitMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.createUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}

export function useUpdateUnitMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.updateUnit,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['units', 'details', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}

export function useBlockUnitMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.blockUnit,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['units', 'details', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}

export function useReserveUnitMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.reserveUnit,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['units', 'details', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}

export function useMarkUnitSoldMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.markUnitSold,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['units', 'details', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}

export function useReleaseUnitMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.releaseUnit,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['units', 'details', variables] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}

import apiClient from '@/api/client';

// ============================================================================
// PROPERTIES (Independent Listing Inventory)
// ============================================================================

export async function fetchProperties(params) {
  const response = await apiClient.get('/properties', { params });
  return response.data;
}

export async function fetchPropertyById(id) {
  const response = await apiClient.get(`/properties/${id}`);
  return response.data;
}

export async function createProperty(data) {
  const response = await apiClient.post('/properties', data);
  return response.data;
}

export async function updateProperty({ id, ...data }) {
  const response = await apiClient.put(`/properties/${id}`, data);
  return response.data;
}

export async function deleteProperty(id) {
  const response = await apiClient.delete(`/properties/${id}`);
  return response.data;
}

export async function markPropertySold(id) {
  const response = await apiClient.post(`/properties/${id}/sold`);
  return response.data;
}

export async function markPropertyReserved(id) {
  const response = await apiClient.post(`/properties/${id}/reserved`);
  return response.data;
}

// ============================================================================
// BUILDERS
// ============================================================================

export async function fetchBuilders(params) {
  const response = await apiClient.get('/projects/builders', { params });
  return response.data;
}

export async function fetchBuilderById(id) {
  const response = await apiClient.get(`/projects/builders/${id}`);
  return response.data;
}

export async function createBuilder(data) {
  const response = await apiClient.post('/projects/builders', data);
  return response.data;
}

export async function updateBuilder({ id, ...data }) {
  const response = await apiClient.put(`/projects/builders/${id}`, data);
  return response.data;
}

export async function deleteBuilder(id) {
  const response = await apiClient.delete(`/projects/builders/${id}`);
  return response.data;
}

// ============================================================================
// AMENITIES
// ============================================================================

export async function fetchAmenities(params) {
  const response = await apiClient.get('/projects/amenities', { params });
  return response.data;
}

// ============================================================================
// PROJECTS
// ============================================================================

export async function fetchProjects(params) {
  const response = await apiClient.get('/projects/projects', { params });
  return response.data;
}

export async function fetchProjectById(id) {
  const response = await apiClient.get(`/projects/projects/${id}`);
  return response.data;
}

export async function createProject(data) {
  const response = await apiClient.post('/projects/projects', data);
  return response.data;
}

export async function updateProject({ id, ...data }) {
  const response = await apiClient.put(`/projects/projects/${id}`, data);
  return response.data;
}

export async function deleteProject(id) {
  const response = await apiClient.delete(`/projects/projects/${id}`);
  return response.data;
}

// ============================================================================
// TOWERS
// ============================================================================

export async function fetchTowers(params) {
  const response = await apiClient.get('/projects/towers', { params });
  return response.data;
}

export async function fetchTowerById(id) {
  const response = await apiClient.get(`/projects/towers/${id}`);
  return response.data;
}

export async function createTower(data) {
  const response = await apiClient.post('/projects/towers', data);
  return response.data;
}

export async function updateTower({ id, ...data }) {
  const response = await apiClient.put(`/projects/towers/${id}`, data);
  return response.data;
}

// ============================================================================
// UNITS
// ============================================================================

export async function fetchUnits(params) {
  const response = await apiClient.get('/projects/units', { params });
  return response.data;
}

export async function fetchUnitById(id) {
  const response = await apiClient.get(`/projects/units/${id}`);
  return response.data;
}

export async function createUnit(data) {
  const response = await apiClient.post('/projects/units', data);
  return response.data;
}

export async function updateUnit({ id, ...data }) {
  const response = await apiClient.put(`/projects/units/${id}`, data);
  return response.data;
}

export async function blockUnit({ id, ...data }) {
  const response = await apiClient.post(`/projects/units/${id}/block`, data);
  return response.data;
}

export async function reserveUnit({ id, ...data }) {
  const response = await apiClient.post(`/projects/units/${id}/reserve`, data);
  return response.data;
}

export async function markUnitSold({ id, ...data }) {
  const response = await apiClient.post(`/projects/units/${id}/sold`, data);
  return response.data;
}

export async function releaseUnit(id) {
  const response = await apiClient.post(`/projects/units/${id}/release`);
  return response.data;
}

export default {
  fetchProperties,
  fetchPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  markPropertySold,
  markPropertyReserved,

  fetchBuilders,
  fetchBuilderById,
  createBuilder,
  updateBuilder,
  deleteBuilder,

  fetchAmenities,

  fetchProjects,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,

  fetchTowers,
  fetchTowerById,
  createTower,
  updateTower,

  fetchUnits,
  fetchUnitById,
  createUnit,
  updateUnit,
  blockUnit,
  reserveUnit,
  markUnitSold,
  releaseUnit
};

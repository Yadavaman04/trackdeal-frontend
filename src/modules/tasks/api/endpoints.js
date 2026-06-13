import apiClient from '@/api/client';

export async function fetchTasks(params) {
  const response = await apiClient.get('/tasks', { params });
  return response.data;
}

export async function fetchTaskById(id) {
  const response = await apiClient.get(`/tasks/${id}`);
  return response.data;
}

export async function createTask(data) {
  const response = await apiClient.post('/tasks', data);
  return response.data;
}

export async function updateTask({ id, ...data }) {
  const response = await apiClient.put(`/tasks/${id}`, data);
  return response.data;
}

export async function deleteTask(id) {
  const response = await apiClient.delete(`/tasks/${id}`);
  return response.data;
}

export async function assignTask({ id, assignedTo }) {
  const response = await apiClient.post(`/tasks/${id}/assign`, { assignedTo });
  return response.data;
}

export async function bulkAssignTasks({ taskIds, assignedTo }) {
  const response = await apiClient.post('/tasks/bulk-assign', { taskIds, assignedTo });
  return response.data;
}

export async function completeTask({ id, outcome, notes }) {
  const response = await apiClient.post(`/tasks/${id}/complete`, { outcome, notes });
  return response.data;
}

export async function cancelTask({ id, cancellationReason }) {
  const response = await apiClient.post(`/tasks/${id}/cancel`, { cancellationReason });
  return response.data;
}

export async function logDirectActivity(data) {
  const response = await apiClient.post('/tasks/activities', data);
  return response.data;
}

export default {
  fetchTasks,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  bulkAssignTasks,
  completeTask,
  cancelTask,
  logDirectActivity
};

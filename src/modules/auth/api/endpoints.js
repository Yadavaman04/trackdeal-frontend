import apiClient from '@/api/client';

export async function login({ email, password }) {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
}

export async function forgotPassword({ email }) {
  const response = await apiClient.post('/auth/forgot-password', { email });
  return response.data;
}

export async function resetPassword({ token, password }) {
  const response = await apiClient.post('/auth/reset-password', { token, password });
  return response.data;
}

export async function validateInvitationToken(token) {
  const response = await apiClient.get(`/auth/invitations/validate?token=${token}`);
  return response.data;
}

export async function acceptInvitation({ token, password }) {
  const response = await apiClient.post('/auth/invitations/accept', { invitationToken: token, password });
  return response.data;
}

export async function refreshTokens(refreshToken) {
  const response = await apiClient.post('/auth/refresh', { refreshToken });
  return response.data;
}

export default {
  login,
  forgotPassword,
  resetPassword,
  validateInvitationToken,
  acceptInvitation,
  refreshTokens
};

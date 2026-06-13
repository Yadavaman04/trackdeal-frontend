import authApi from '@/modules/auth/api/endpoints';

function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (e) {
    return null;
  }
}

export default {
  namespaced: true,
  state: () => ({
    token: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    sessionExpiresAt: localStorage.getItem('sessionExpiresAt') ? Number(localStorage.getItem('sessionExpiresAt')) : null,
    currentUser: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null
  }),
  mutations: {
    SET_TOKEN(state, { accessToken, refreshToken, expiresAt }) {
      state.token = accessToken;
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        state.refreshToken = refreshToken;
        localStorage.setItem('refreshToken', refreshToken);
      }
      state.sessionExpiresAt = expiresAt;
      localStorage.setItem('sessionExpiresAt', expiresAt);
    },
    CLEAR_SESSION(state) {
      state.token = null;
      state.refreshToken = null;
      state.sessionExpiresAt = null;
      state.currentUser = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('sessionExpiresAt');
      localStorage.removeItem('currentUser');
    },
    SET_USER_PROFILE(state, profile) {
      state.currentUser = profile;
      if (profile) {
        localStorage.setItem('currentUser', JSON.stringify(profile));
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  },
  actions: {
    loginUser({ commit }, { accessToken, refreshToken, profile }) {
      commit('SET_TOKEN', { accessToken, refreshToken, expiresAt: Date.now() + 3600000 });
      commit('SET_USER_PROFILE', profile);
      
      const decoded = parseJwt(accessToken) || {};
      const permissions = decoded.permissions || profile?.permissions || [];
      const tenantId = decoded.organizationId || profile?.tenantId || profile?.organizationId;
      const organizationType = decoded.organizationType || profile?.organizationType || 'AGENCY';
 
      // Fetch permissions scoping
      commit('permissions/SET_CAPABILITIES', permissions, { root: true });
      // Fetch dynamic tenant values
      commit('organization/SET_ORGANIZATION', {
        tenantId,
        organizationType,
        branding: profile?.branding || {},
        featuresFlags: profile?.featuresFlags || {}
      }, { root: true });
    },
    logoutSession({ commit }) {
      commit('CLEAR_SESSION');
      commit('permissions/CLEAR_CAPABILITIES', null, { root: true });
      commit('organization/CLEAR_ORGANIZATION', null, { root: true });
    },
    async refreshUserTokens({ commit, state }) {
      try {
        const data = await authApi.refreshTokens(state.refreshToken);
        const payload = data.data || data;
        
        commit('SET_TOKEN', { accessToken: payload.accessToken, refreshToken: payload.refreshToken, expiresAt: Date.now() + 3600000 });
        commit('SET_USER_PROFILE', payload.user);
        
        const decoded = parseJwt(payload.accessToken) || {};
        const permissions = decoded.permissions || payload.user?.permissions || [];
        const tenantId = decoded.organizationId || payload.user?.tenantId || payload.user?.organizationId;
        const organizationType = decoded.organizationType || payload.user?.organizationType || 'AGENCY';
 
        commit('permissions/SET_CAPABILITIES', permissions, { root: true });
        commit('organization/SET_ORGANIZATION', {
          tenantId,
          organizationType,
          branding: payload.user?.branding || {},
          featuresFlags: payload.user?.featuresFlags || {}
        }, { root: true });
        
        return payload;
      } catch (error) {
        commit('CLEAR_SESSION');
        commit('permissions/CLEAR_CAPABILITIES', null, { root: true });
        commit('organization/CLEAR_ORGANIZATION', null, { root: true });
        throw error;
      }
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => {
      if (!state.token) return null;
      const decoded = parseJwt(state.token);
      return decoded?.role || state.currentUser?.role || null;
    },
    organizationType: (state) => {
      if (!state.token) return null;
      const decoded = parseJwt(state.token);
      return decoded?.organizationType || state.currentUser?.organizationType || null;
    }
  }
};

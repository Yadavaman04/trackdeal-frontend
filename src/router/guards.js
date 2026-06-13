import store from '@/store';

let sessionChecked = false;

export function setupRouterGuards(router) {
  router.beforeEach(async (to, from, next) => {
    // 1. Session Restoration on Application Boot
    if (!sessionChecked) {
      sessionChecked = true;
      const isAuthenticated = store.getters['auth/isAuthenticated'];
      if (!isAuthenticated) {
        try {
          // Attempt silent refresh to restore session via HTTP-only cookie
          await store.dispatch('auth/refreshUserTokens');
        } catch (error) {
          // Silent refresh failed (no valid refresh cookie), ignore and let standard guards handle redirects
        }
      }
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const isAuthenticated = store.getters['auth/isAuthenticated'];

    if (requiresAuth && !isAuthenticated) {
      store.dispatch('notifications/triggerToast', {
        message: 'Your session has expired. Please log in to continue.',
        type: 'error'
      });
      return next({ path: '/login', query: { redirect: to.fullPath } });
    }

    if (to.path === '/login' && isAuthenticated) {
      return next({ path: '/app/dashboard' });
    }

    // 2. Feature Flag Check
    const requiredFeature = to.meta.featureFlag;
    if (requiredFeature) {
      const isFeatureActive = store.getters['organization/isFeatureEnabled'](requiredFeature);
      if (!isFeatureActive) {
        store.dispatch('notifications/triggerToast', {
          message: 'Requested module is disabled for your organization.',
          type: 'warning'
        });
        return next({ path: '/app/dashboard' });
      }
    }

    // 3. RBAC Scopes Check
    const requiredPermission = to.meta.permission;
    if (requiredPermission) {
      const isSuperAdmin = store.getters['auth/userRole'] === 'super_admin';
      if (!isSuperAdmin) {
        const hasCapability = store.getters['permissions/hasCapability'](requiredPermission);
        if (!hasCapability) {
          store.dispatch('notifications/triggerToast', {
            message: 'Unauthorized: You do not possess access permissions for this route.',
            type: 'error'
          });
          return next({ path: '/app/dashboard' });
        }
      }
    }

    // 4. Org Type Guard (before navigation)
    const requiredOrgTypes = to.meta.requiresOrgType;
    if (requiredOrgTypes && Array.isArray(requiredOrgTypes)) {
      const orgType = store.getters['organization/organizationType'];
      if (!requiredOrgTypes.includes(orgType)) {
        store.dispatch('notifications/triggerToast', {
          message: 'This feature is not available for your organization type.',
          type: 'warning'
        });
        return next({ path: '/app/dashboard' });
      }
    }

    next();
  });
}

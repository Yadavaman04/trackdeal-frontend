import { computed } from 'vue';
import { useStore } from 'vuex';

export function usePermissions() {
  const store = useStore();

  const userRole = computed(() => store.getters['auth/userRole']);
  const isSuperAdmin = computed(() => userRole.value === 'super_admin');

  /**
   * Evaluates if the current user possesses the required capability scope.
   * Super Admins bypass permission checks.
   * @param {string} permission - The required permission string (e.g. 'lead.delete')
   * @returns {boolean}
   */
  const hasPermission = (permission) => {
    if (isSuperAdmin.value) return true;
    if (!permission) return true;
    return store.getters['permissions/hasCapability'](permission);
  };

  return {
    userRole,
    isSuperAdmin,
    hasPermission
  };
}
export default usePermissions;

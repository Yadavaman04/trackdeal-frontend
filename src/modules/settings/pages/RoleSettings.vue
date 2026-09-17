<template>
  <div class="space-y-6 text-xs">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-heading text-xl font-extrabold text-slate-800 dark:text-slate-100">Roles & Permissions</h1>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">Configure role-based access control, security profiles, and granular capability matrices.</p>
      </div>
    </div>

    <!-- Permissions Matrix -->
    <div class="space-y-6">
      <div v-if="!roles || roles.length === 0" class="bg-surface border border-default rounded-xl p-8 text-center text-slate-500 dark:text-slate-400 shadow-sm">
        <p class="font-semibold text-xs">No security roles found</p>
        <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Please make sure roles are properly initialized in the database.</p>
      </div>
      <template v-else>
        <div class="bg-surface border border-default rounded-xl p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-default pb-3">
            <div>
              <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">Security Profile Directory</h3>
              <p class="text-[9px] text-slate-500 dark:text-slate-400">Clone and select template structures for custom role creation.</p>
            </div>
            <button
              @click="openCloneModal"
              class="btn-sm btn-secondary gap-1.5"
            >
              <PhCopy :size="12" />
              <span>Clone Active Profile</span>
            </button>
          </div>

          <!-- Active Roles list inline summary -->
          <div class="flex flex-wrap gap-2.5">
            <button
              v-for="role in roles"
              :key="role.id || role._id"
              @click="selectedRoleId = role.id || role._id"
              class="px-3.5 py-2.5 border rounded-xl text-left hover:border-primary transition-all flex-1 min-w-[170px] relative group"
              :class="selectedRoleId === (role.id || role._id) ? 'border-primary bg-primary/5 text-primary shadow-xs' : 'border-default bg-surface hover:bg-slate-50/60 dark:hover:bg-slate-800/40'"
            >
              <div class="font-bold flex items-center justify-between gap-1.5">
                <span class="text-xs text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">{{ role.name }}</span>
                <span v-if="role.isCustom" class="text-[8px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded px-1.5 py-0.5 border border-default">Custom</span>
              </div>
              <div class="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{{ getRoleSubtitle(role) }}</div>
            </button>
          </div>
        </div>

        <PermissionMatrix
          v-model="selectedRoleId"
          :roles="roles || []"
          :isSaving="savingMatrix"
          @save="savePermissionMatrix"
        />
      </template>
    </div>

    <!-- Role Clone Modal (Opens from right side) -->
    <RoleCloneModal
      :isOpen="cloneModalOpen"
      :sourceRole="activeSourceRole"
      @close="cloneModalOpen = false"
      @success="refetchRoles"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useQueryClient } from '@tanstack/vue-query';
import { PhCopy } from '@phosphor-icons/vue';
import {
  useRolesQuery,
  useUpdateRolePermissionsMutation
} from '../queries';
import PermissionMatrix from '../components/PermissionMatrix.vue';
import RoleCloneModal from '../components/RoleCloneModal.vue';

const store = useStore();
const queryClient = useQueryClient();

const isEducation = computed(() => store.getters['organization/isEducationTenant']);

function getRoleSubtitle(role) {
  const code = String(role.code || role.name || '').toLowerCase().replace(/[^a-z_]/g, '');
  if (isEducation.value) {
    if (code.includes('super_admin')) return 'System Security & Root';
    if (code.includes('admin') || code.includes('org')) return 'Principal / Director';
    if (code.includes('manager')) return 'Admissions Head / Academic Lead';
    if (code.includes('agent')) return 'Counselor / Admissions Officer';
    if (code.includes('read_only') || code.includes('readonly')) return 'Faculty / Staff View';
    return role.description || (role.isCustom ? 'Custom Role' : 'Education Staff Role');
  } else {
    if (code.includes('super_admin')) return 'System Security & Root';
    if (code.includes('admin') || code.includes('org')) return 'Executive / Managing Director';
    if (code.includes('manager')) return 'Sales Manager / Team Lead';
    if (code.includes('agent')) return 'Property Sales Consultant';
    if (code.includes('read_only') || code.includes('readonly')) return 'Auditor / Read-Only Access';
    return role.description || (role.isCustom ? 'Custom Role' : 'Sales Security Role');
  }
}

const selectedRoleId = ref('');

// Queries
const { data: roles } = useRolesQuery();

watch(roles, (list) => {
  if (list && list.length > 0 && !selectedRoleId.value) {
    selectedRoleId.value = list[0].id || list[0]._id;
  }
}, { immediate: true });

// Mutations
const { mutateAsync: updateRolePermissions } = useUpdateRolePermissionsMutation();

// Loading states
const savingMatrix = ref(false);

// Clone Modal
const cloneModalOpen = ref(false);

const activeSourceRole = computed(() => {
  return roles.value?.find(r => (r.id || r._id) === selectedRoleId.value) || null;
});

function openCloneModal() {
  cloneModalOpen.value = true;
}

function refetchRoles() {
  queryClient.invalidateQueries({ queryKey: ['settings', 'roles'] });
}

// Permission Matrix Save
async function savePermissionMatrix({ roleId, permissions }) {
  savingMatrix.value = true;
  try {
    await updateRolePermissions({ id: roleId, permissions });
    store.dispatch('notifications/triggerToast', {
      message: `Permission matrix for role "${roleId}" updated successfully.`,
      type: 'success'
    });
    refetchRoles();
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to update role permissions configuration.',
      type: 'error'
    });
  } finally {
    savingMatrix.value = false;
  }
}
</script>

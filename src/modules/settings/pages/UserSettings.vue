<template>
  <div class="space-y-6 text-xs">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-heading text-xl font-extrabold text-slate-800 dark:text-slate-100">User Management & Audit Trails</h1>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">Invite new team members, manage account suspensions, transfer regional branches, and review activity audit logs.</p>
      </div>
      <button
        @click="openInviteDrawer"
        class="btn-md btn-primary gap-1.5"
      >
        <PhPlus :size="14" />
        <span>Invite User</span>
      </button>
    </div>

    <!-- Inner Tabs -->
    <div class="flex border-b border-default overflow-x-auto space-x-4 pb-0.5 scrollbar-none">
      <button
        @click="activeTab = 'directory'"
        class="py-2.5 px-1.5 border-b-2 font-bold text-xs transition-colors shrink-0"
        :class="activeTab === 'directory' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'"
      >
        User Directory ({{ users?.length || 0 }})
      </button>
      <button
        @click="activeTab = 'audit'"
        class="py-2.5 px-1.5 border-b-2 font-bold text-xs transition-colors shrink-0"
        :class="activeTab === 'audit' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'"
      >
        Immutable Audit Logs
      </button>
    </div>

    <!-- Tab Contents -->
    <div class="space-y-6">
      <!-- 1. User Directory Tab -->
      <div v-if="activeTab === 'directory'" class="bg-surface border border-default rounded-xl p-6 shadow-sm space-y-4">
        <!-- Users Table -->
        <div class="overflow-x-auto border border-default rounded-lg">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-b border-default font-semibold">
                <th class="p-3">Full Name</th>
                <th class="p-3">Official Email</th>
                <th class="p-3">Access Role</th>
                <th v-if="isEnterprise" class="p-3">Assigned Branch</th>
                <th class="p-3 text-center">Status</th>
                <th class="p-3 text-center">Operations</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                <td class="p-3 font-bold text-slate-850 dark:text-slate-200">{{ user.name || user.fullName }}</td>
                <td class="p-3 text-slate-600 dark:text-slate-400 font-mono">{{ user.email }}</td>
                <td class="p-3 text-slate-750 dark:text-slate-300 capitalize font-semibold">
                  <span class="px-2 py-0.5 rounded text-[10px] border" :class="getRoleBadgeClass(getRoleCode(user.role))">
                    {{ getRoleDisplayName(user.role) }}
                  </span>
                </td>
                <td v-if="isEnterprise" class="p-3 font-semibold text-slate-600 dark:text-slate-400">{{ user.branch || user.branchId?.name || '' }}</td>
                <td class="p-3 text-center">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      :checked="user.active"
                      @change="toggleUserStatus(user)"
                      class="sr-only peer"
                      :disabled="isSuperAdminSelf(user)"
                    />
                    <div class="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-disabled:opacity-50"></div>
                  </label>
                </td>
                <td class="p-3 text-center space-x-1 flex items-center justify-center">
                  <button
                    v-if="isEnterprise"
                    @click="triggerTransfer(user)"
                    class="btn btn-sm btn-ghost text-primary text-[10px] h-6 px-1.5 gap-1 font-bold"
                    :disabled="!user.active"
                    :class="!user.active ? 'opacity-40 cursor-not-allowed' : ''"
                  >
                    <PhMapPin :size="10" />
                    <span>Transfer Office</span>
                  </button>
                  <button
                    @click="triggerRoleSwap(user)"
                    class="btn btn-sm btn-ghost text-slate-600 dark:text-slate-400 text-[10px] h-6 px-1.5 gap-1 font-bold"
                    :disabled="isSuperAdminSelf(user) || !user.active"
                    :class="(isSuperAdminSelf(user) || !user.active) ? 'opacity-40 cursor-not-allowed' : ''"
                  >
                    <PhKey :size="10" />
                    <span>Adjust Role</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Audit logs Tab -->
      <div v-if="activeTab === 'audit'">
        <AuditTimeline :logs="auditLogs || []" />
      </div>
    </div>

    <!-- Invite User Drawer -->
    <UserInviteDrawer
      :isOpen="inviteDrawerOpen"
      :roles="roles || []"
      :branches="branches || []"
      @close="inviteDrawerOpen = false"
      @success="refetchData"
    />

    <!-- Transfer Branch Drawer -->
    <BranchTransferDrawer
      :isOpen="transferDrawerOpen"
      :user="activeUser"
      :branches="branches || []"
      @close="transferDrawerOpen = false"
      @success="refetchData"
    />

    <!-- Change Role Drawer -->
    <RoleChangeDrawer
      :isOpen="roleDrawerOpen"
      :user="activeUser"
      :roles="roles || []"
      @close="roleDrawerOpen = false"
      @success="refetchData"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useQueryClient } from '@tanstack/vue-query';
import { PhPlus, PhMapPin, PhKey } from '@phosphor-icons/vue';
import {
  useUsersQuery,
  useRolesQuery,
  useBranchesQuery,
  useAuditLogsQuery,
  useSuspendUserMutation
} from '../queries';
import UserInviteDrawer from '../components/UserInviteDrawer.vue';
import BranchTransferDrawer from '../components/BranchTransferDrawer.vue';
import RoleChangeDrawer from '../components/RoleChangeDrawer.vue';
import AuditTimeline from '../components/AuditTimeline.vue';

const store = useStore();
const queryClient = useQueryClient();

const activeTab = ref('directory');
const isEnterprise = computed(() => store.getters['organization/isEnterpriseAgency']);

// TanStack queries
const { data: users } = useUsersQuery();
const { data: roles } = useRolesQuery();
const { data: branches } = useBranchesQuery();
const { data: auditLogs } = useAuditLogsQuery();
const { mutateAsync: suspendUser } = useSuspendUserMutation();

// Drawer visibility states
const inviteDrawerOpen = ref(false);
const transferDrawerOpen = ref(false);
const roleDrawerOpen = ref(false);
const activeUser = ref(null);

function openInviteDrawer() {
  inviteDrawerOpen.value = true;
}

function triggerTransfer(user) {
  activeUser.value = user;
  transferDrawerOpen.value = true;
}

function triggerRoleSwap(user) {
  activeUser.value = user;
  roleDrawerOpen.value = true;
}

function isSuperAdminSelf(user) {
  // Prevent logged in user from suspending self or changing self super admin role
  const loggedInEmail = store.state.auth?.currentUser?.email || '';
  return user.email === loggedInEmail;
}

async function toggleUserStatus(user) {
  if (isSuperAdminSelf(user)) return;

  const targetState = !user.active;
  const statusWord = targetState ? 'activated' : 'suspended';

  if (!confirm(`Are you sure you want to ${statusWord} ${user.name}?`)) {
    // Reset toggle visually
    queryClient.invalidateQueries({ queryKey: ['settings', 'users'] });
    return;
  }

  try {
    await suspendUser({
      id: user.id,
      suspend: !targetState
    });
    store.dispatch('notifications/triggerToast', {
      message: `User profile successfully ${statusWord}.`,
      type: 'success'
    });
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to toggle user activation status.',
      type: 'error'
    });
    queryClient.invalidateQueries({ queryKey: ['settings', 'users'] });
  }
}

function getRoleBadgeClass(role) {
  switch (role) {
    case 'super_admin':
      return 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-900/40';
    case 'branch_manager':
      return 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/40';
    default:
      return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-slate-700';
  }
}

function getRoleCode(role) {
  if (!role) return '';
  if (typeof role === 'object') {
    return role.code || '';
  }
  return String(role);
}

function getRoleDisplayName(role) {
  if (!role) return '';
  const val = typeof role === 'object' ? role.name || role.code || '' : String(role);
  return val.replace('_', ' ');
}

function refetchData() {
  queryClient.invalidateQueries({ queryKey: ['settings', 'users'] });
  queryClient.invalidateQueries({ queryKey: ['settings', 'audit'] });
}
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>

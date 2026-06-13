<template>
  <div class="bg-surface border border-default rounded-xl p-6 shadow-sm space-y-6">
    <div v-if="!roles || roles.length === 0" class="text-center py-8 text-slate-500">
      <p class="font-semibold text-xs">No roles found.</p>
      <p class="text-[10px] text-slate-400 mt-1">Please make sure user roles are properly configured in the system.</p>
    </div>
    <div v-else class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">Permissions Matrix</h3>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">Configure role-based access control (RBAC) scopes across system modules.</p>
        </div>
        <div class="flex items-center space-x-2">
          <label class="text-xs font-semibold text-slate-650 dark:text-slate-400 shrink-0">Active Role:</label>
          <select
            v-model="selectedRoleId"
            class="bg-surface border border-default rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-200 font-semibold"
          >
            <option v-for="role in roles" :key="role.id || role._id" :value="role.id || role._id">
              {{ role.name }}
            </option>
          </select>
        </div>
      </div>
 
      <!-- Desktop Table View -->
      <div class="hidden md:block overflow-x-auto border border-default rounded-lg">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-b border-default">
              <th class="p-3 font-semibold">Feature Scope</th>
              <th class="p-3 font-semibold text-center">Create (C)</th>
              <th class="p-3 font-semibold text-center">Read (R)</th>
              <th class="p-3 font-semibold text-center">Update (U)</th>
              <th class="p-3 font-semibold text-center">Delete (D)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default">
            <tr v-for="scope in scopes" :key="scope.key" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
              <td class="p-3 font-bold text-slate-700 dark:text-slate-200 capitalize">{{ scope.label }}</td>
              <td v-for="action in actions" :key="action" class="p-3 text-center">
                <label class="inline-flex items-center justify-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    v-model="matrix[scope.key][action]"
                    :disabled="isSuperAdmin"
                    class="sr-only peer"
                  />
                  <div class="w-20 py-1 rounded-md text-[10px] font-bold border transition-all text-center
                    peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-950/20 peer-checked:text-emerald-700 dark:peer-checked:text-emerald-400 peer-checked:border-emerald-200 dark:peer-checked:border-emerald-900/40
                    peer-disabled:opacity-60
                    bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/40"
                  >
                    {{ matrix[scope.key][action] ? 'Allowed' : 'Denied' }}
                  </div>
                </label>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
 
      <!-- Mobile Stacked Card View -->
      <div class="md:hidden space-y-4">
        <div v-for="scope in scopes" :key="scope.key" class="border border-default rounded-lg p-4 bg-slate-50/30 dark:bg-slate-850/20 space-y-3">
          <div class="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize border-b border-default pb-1.5">
            {{ scope.label }} Scope
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="action in actions" :key="action" class="flex flex-col space-y-1">
              <span class="text-[9px] font-semibold text-slate-400 dark:text-slate-500 capitalize">{{ action }}</span>
              <label class="relative cursor-pointer select-none">
                <input
                  type="checkbox"
                  v-model="matrix[scope.key][action]"
                  :disabled="isSuperAdmin"
                  class="sr-only peer"
                />
                <div class="w-full py-1.5 rounded-md text-[10px] font-bold border transition-all text-center
                  peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-950/20 peer-checked:text-emerald-700 dark:peer-checked:text-emerald-400 peer-checked:border-emerald-200 dark:peer-checked:border-emerald-900/40
                  peer-disabled:opacity-60
                  bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/40"
                >
                  {{ matrix[scope.key][action] ? 'Allowed' : 'Denied' }}
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-2 pt-2">
        <button
          @click="resetMatrix"
          class="btn-md btn-secondary"
          :disabled="isSaving || isSuperAdmin"
        >
          Reset Changes
        </button>
        <button
          @click="saveMatrix"
          class="btn-md btn-primary gap-1.5"
          :disabled="isSaving || isSuperAdmin"
        >
          <PhFloppyDisk :size="14" />
          <span v-if="isSaving">Saving...</span>
          <span v-else>Save Matrix</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { PhFloppyDisk } from '@phosphor-icons/vue';

const props = defineProps({
  roles: { type: Array, required: true },
  isSaving: { type: Boolean, default: false },
  modelValue: { type: String, default: '' }
});

const emit = defineEmits(['save', 'update:modelValue']);

const scopes = [
  { key: 'leads', label: 'Leads' },
  { key: 'deals', label: 'Deals' },
  { key: 'commissions', label: 'Commissions' },
  { key: 'properties', label: 'Properties' },
  { key: 'reports', label: 'Reports' }
];

const actions = ['create', 'read', 'update', 'delete'];

const matrix = ref({});

const selectedRoleId = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// Load selected role permissions on mount/updates
watch([selectedRoleId, () => props.roles], () => {
  loadRolePermissions();
}, { deep: true, immediate: true });

const isSuperAdmin = computed(() => selectedRoleId.value === 'super_admin' || selectedRoleId.value === 'super_admin_id');

function loadRolePermissions() {
  const role = props.roles.find(r => (r.id || r._id) === selectedRoleId.value);
  if (!role) return;

  const tempMatrix = {};
  scopes.forEach(scope => {
    tempMatrix[scope.key] = {};
    actions.forEach(action => {
      // Set value based on current role configuration. Super admins have full access.
      if (isSuperAdmin.value) {
        tempMatrix[scope.key][action] = true;
      } else {
        tempMatrix[scope.key][action] = role.permissions?.[scope.key]?.[action] || false;
      }
    });
  });
  matrix.value = tempMatrix;
}

function resetMatrix() {
  loadRolePermissions();
}

function saveMatrix() {
  emit('save', {
    roleId: selectedRoleId.value,
    permissions: matrix.value
  });
}
</script>

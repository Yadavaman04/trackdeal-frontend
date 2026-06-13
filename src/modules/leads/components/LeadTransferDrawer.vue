<template>
  <AppDrawer 
    :isOpen="isOpen" 
    title="Transfer Lead Context" 
    width="480px"
    @close="$emit('close')"
  >
    <div class="space-y-4 text-xs">
      <!-- Warning info block -->
      <div class="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-3 text-indigo-800 dark:text-indigo-400">
        <h4 class="font-heading font-bold text-xs mb-1">Collaboration & Assignment Controls</h4>
        <p class="text-[10px] leading-relaxed">
          Transfer ownership of this lead to another agent, change the branch location, or assign collaborative agents to assist.
        </p>
      </div>

      <!-- Assigned Agent (POST /leads/:id/assign) -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">New Owner Agent</label>
        <select 
          v-model="assignedTo" 
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
        >
          <option value="">Keep Current / Unassigned</option>
          <option v-for="u in agentsList" :key="u.id || u._id" :value="u.id || u._id">
            {{ u.name }}
          </option>
        </select>
      </div>

      <!-- Transfer Reason (Required if owner changes) -->
      <div v-if="ownerChanged">
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Transfer Reason *</label>
        <input 
          v-model="reason" 
          type="text" 
          placeholder="Provide reason for reassigning owner agent..."
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="reasonError ? 'border-red-500' : 'border-default'"
        />
        <span v-if="reasonError" class="text-[9px] text-red-500 mt-1 block">{{ reasonError }}</span>
      </div>

      <!-- Branch Office (PUT /leads/:id) -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Branch Office Location</label>
        <select 
          v-model="branchId" 
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
        >
          <option value="">Default Branch</option>
          <option v-for="b in branchesList" :key="b.id || b._id" :value="b.id || b._id">
            {{ b.name }}
          </option>
        </select>
      </div>

      <!-- Collaborators multi select (PUT /leads/:id) -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Collaborators (Select Assistants)</label>
        <div class="flex flex-wrap gap-2.5 mt-1 border border-default p-2.5 rounded-lg bg-slate-50/50">
          <label v-for="c in agentsList" :key="c.id || c._id" class="flex items-center space-x-1.5">
            <input type="checkbox" :value="c.id || c._id" v-model="collaborators" class="rounded border-default text-primary focus:ring-primary" />
            <span class="text-[10px]">{{ c.name }}</span>
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <button 
        @click="$emit('close')" 
        class="px-4 py-2 border border-default rounded-lg hover:bg-slate-50 font-semibold"
      >
        Cancel
      </button>
      <button 
        @click="onTransfer"
        :disabled="isPending"
        class="px-4 py-2 bg-primary text-white rounded-lg disabled:bg-slate-300 font-semibold flex items-center justify-center min-w-[100px]"
      >
        <span v-if="isPending">Transferring...</span>
        <span v-else>Confirm Transfer</span>
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import AppDrawer from '@/components/AppDrawer.vue';
import { useAssignLeadMutation, useUpdateLeadMutation } from '../queries';
import { useBranchesQuery, useUsersQuery } from '@/modules/settings/queries';

const { data: branchesData } = useBranchesQuery();
const { data: usersData } = useUsersQuery();

const branchesList = computed(() => {
  const data = branchesData.value?.data || branchesData.value;
  return Array.isArray(data) ? data : [];
});

const agentsList = computed(() => {
  const data = usersData.value?.data || usersData.value;
  return Array.isArray(data) ? data.filter(u => u.active) : [];
});
const props = defineProps({
  isOpen: { type: Boolean, required: true },
  lead: { type: Object, required: true }
});

const emit = defineEmits(['close', 'success']);

const store = useStore();
const assignedTo = ref('');
const reason = ref('');
const reasonError = ref('');
const branchId = ref('');
const collaborators = ref([]);

const ownerChanged = computed(() => {
  const currentAssigned = props.lead.assignedTo?._id || props.lead.assignedTo || null;
  const targetAssigned = assignedTo.value || null;
  return currentAssigned !== targetAssigned;
});
const populateForm = () => {
  if (props.lead) {
    assignedTo.value = props.lead.assignedTo?._id || props.lead.assignedTo || '';
    branchId.value = props.lead.branchId || '';
    collaborators.value = props.lead.collaborators || [];
    reason.value = '';
    reasonError.value = '';
  }
};

onMounted(populateForm);
watch(() => props.lead, populateForm);

const { mutateAsync: assignOwner, isPending: assignPending } = useAssignLeadMutation();
const { mutateAsync: updateLead, isPending: updatePending } = useUpdateLeadMutation();

const isPending = computed(() => assignPending.value || updatePending.value);

const onTransfer = async () => {
  reasonError.value = '';
  const leadId = props.lead._id || props.lead.id;

  if (ownerChanged.value && !reason.value.trim()) {
    reasonError.value = 'Transfer reason is required when reassigning owner agent.';
    return;
  }

  try {
    // 1. Reassign agent if changed
    if (ownerChanged.value) {
      await assignOwner({
        id: leadId,
        assignedTo: assignedTo.value || undefined,
        reason: reason.value
      });
    }

    // 2. Update branch and collaborators
    await updateLead({
      id: leadId,
      branchId: branchId.value || undefined,
      collaborators: collaborators.value
    });

    store.dispatch('notifications/triggerToast', {
      message: 'Lead context transferred successfully.',
      type: 'success'
    });
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Transfer failed.',
      type: 'error'
    });
  }
};
</script>

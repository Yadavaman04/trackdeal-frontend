<template>
  <AppDrawer 
    :isOpen="isOpen" 
    title="Transfer Lead & Agent Controls" 
    width="520px"
    @close="$emit('close')"
  >
    <div class="space-y-5 text-xs">
      <!-- Warning info block -->
      <div class="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-3 text-indigo-800 dark:text-indigo-400">
        <h4 class="font-heading font-bold text-xs mb-1">Single Source of Truth Transfer Master</h4>
        <p class="text-[11px] leading-relaxed">
          Transfer lead ownership to internal executives or external Channel Partners. Newly created agents immediately reflect across all CRM modules.
        </p>
      </div>

      <!-- Transfer Target Type Tabs -->
      <div class="flex border-b border-default">
        <button
          type="button"
          @click="transferType = 'user'"
          class="flex-1 py-2 text-caption font-semibold border-b-2 transition-colors text-center"
          :class="transferType === 'user' ? 'border-primary text-primary' : 'border-transparent text-slate-500'"
        >
          Internal User / Executive
        </button>
        <button
          type="button"
          @click="transferType = 'agent'"
          class="flex-1 py-2 text-caption font-semibold border-b-2 transition-colors text-center flex items-center justify-center gap-1.5"
          :class="transferType === 'agent' ? 'border-primary text-primary' : 'border-transparent text-slate-500'"
        >
          <span>Channel Partner / Broker</span>
          <span class="px-1.5 py-0.2 rounded-full text-[9px] bg-accent-100 text-accent-700 font-bold">MASTER</span>
        </button>
      </div>

      <!-- OPTION A: Internal User Assignment -->
      <div v-if="transferType === 'user'" class="space-y-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">New Internal Owner Executive</label>
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
      </div>

      <!-- OPTION B: Channel Partner Master Selection (Multi-Select Support) -->
      <div v-else class="space-y-3">
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-[10px] font-bold text-slate-500 uppercase">
              Select Channel Partners / Brokers (Select One or Multiple) *
            </label>
            <button
              type="button"
              @click="quickModalOpen = true"
              class="text-caption font-semibold text-accent-600 hover:underline flex items-center gap-1"
            >
              <span>+ Add New Agent</span>
            </button>
          </div>

          <!-- Multi-select list -->
          <div class="border border-default rounded-lg p-2.5 max-h-48 overflow-y-auto space-y-1.5 bg-slate-50/50 dark:bg-slate-800/30">
            <div v-if="activeAgentsList.length === 0" class="text-caption text-slate-400 p-2 text-center">
              No active channel partners registered yet. Click "+ Add New Agent" above.
            </div>

            <label
              v-for="ag in activeAgentsList"
              :key="ag._id"
              class="flex items-center gap-2.5 p-2 rounded-md hover:bg-white dark:hover:bg-slate-700/60 transition-colors cursor-pointer border border-transparent hover:border-default"
            >
              <input
                type="checkbox"
                :value="ag._id"
                v-model="selectedAgentIds"
                class="rounded border-default text-accent-600 focus:ring-accent-500 w-4 h-4"
              />
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-caption text-slate-900 dark:text-slate-100 truncate">
                  {{ ag.name }}
                </p>
                <p class="text-[10px] text-slate-500 truncate">
                  <AppIcon name="buildings" :size="11" class="inline" /> {{ ag.officeName }} • {{ ag.city || 'CP' }} ({{ ag.phone }})
                </p>
              </div>
            </label>
          </div>
          <p class="text-[10px] text-slate-400 mt-1">
            Selected: <span class="font-bold text-accent-600">{{ selectedAgentIds.length }} Channel Partner(s)</span>
          </p>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Transfer Remarks & Handover Notes</label>
          <textarea 
            v-model="agentRemarks" 
            rows="3" 
            placeholder="Enter handover details for channel partners (e.g. prospect availability, preferred projects)..."
            class="w-full bg-surface border border-default rounded-lg p-2.5 outline-none focus:border-primary text-xs"
          ></textarea>
        </div>
      </div>

      <!-- Branch Office -->
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

      <!-- Transfer History Log Summary -->
      <div v-if="lead?.transferHistory?.length > 0" class="pt-3 border-t border-default space-y-2">
        <h4 class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Transfer Audit History</h4>
        <div class="space-y-2 max-h-36 overflow-y-auto pr-1">
          <div
            v-for="(hist, idx) in lead.transferHistory.slice().reverse()"
            :key="idx"
            class="p-2.5 rounded-lg border border-default bg-slate-50 dark:bg-slate-800/50 text-[11px]"
          >
            <div class="flex justify-between items-start font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
              <span class="inline-flex items-center gap-1">{{ hist.fromName }} <AppIcon name="arrowRight" :size="11" /> {{ hist.toAgentName }}</span>
              <span class="text-[9px] text-slate-400 font-normal">{{ formatDate(hist.transferredAt) }}</span>
            </div>
            <p v-if="hist.remarks" class="text-slate-500 italic text-[10px]">"{{ hist.remarks }}"</p>
            <span class="text-[9px] text-slate-400 block mt-0.5">By: {{ hist.transferredByName }}</span>
          </div>
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
        class="px-4 py-2 bg-primary text-white rounded-lg disabled:bg-slate-300 font-semibold flex items-center justify-center min-w-[120px]"
      >
        <span v-if="isPending">Transferring...</span>
        <span v-else>Confirm Transfer</span>
      </button>
    </template>

    <AgentQuickCreateModal
      :open="quickModalOpen"
      @close="quickModalOpen = false"
      @created="handleAgentCreated"
    />
  </AppDrawer>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useQueryClient } from '@tanstack/vue-query';
import Swal from 'sweetalert2';
import AppDrawer from '@/components/AppDrawer.vue';
import AgentQuickCreateModal from '@/modules/agents/components/AgentQuickCreateModal.vue';
import { useAssignLeadMutation, useUpdateLeadMutation } from '../queries';
import { useActiveAgentsQuery, useTransferLeadToAgentMutation } from '@/modules/agents/queries';
import { useBranchesQuery, useUsersQuery } from '@/modules/settings/queries';

const { data: branchesData } = useBranchesQuery();
const { data: usersData } = useUsersQuery();
const { data: activeAgentsData } = useActiveAgentsQuery();

const branchesList = computed(() => {
  const data = branchesData.value?.data || branchesData.value;
  return Array.isArray(data) ? data : [];
});

const agentsList = computed(() => {
  const data = usersData.value?.data || usersData.value;
  return Array.isArray(data) ? data.filter(u => u.active) : [];
});

const activeAgentsList = computed(() => activeAgentsData.value?.data || []);

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  lead: { type: Object, required: true }
});

const emit = defineEmits(['close', 'success']);

const store = useStore();
const transferType = ref('user');
const assignedTo = ref('');
const selectedAgentIds = ref([]);
const quickModalOpen = ref(false);
const agentRemarks = ref('');
const reason = ref('');
const reasonError = ref('');
const branchId = ref('');

const ownerChanged = computed(() => {
  const currentAssigned = props.lead.assignedTo?._id || props.lead.assignedTo || null;
  const targetAssigned = assignedTo.value || null;
  return currentAssigned !== targetAssigned;
});

const populateForm = () => {
  if (props.lead) {
    assignedTo.value = props.lead.assignedTo?._id || props.lead.assignedTo || '';

    // Extract existing assigned CPs
    const existingCPs = [];
    if (Array.isArray(props.lead.agentIds) && props.lead.agentIds.length > 0) {
      existingCPs.push(...props.lead.agentIds.map(a => a._id || a));
    } else if (props.lead.agentId) {
      existingCPs.push(props.lead.agentId._id || props.lead.agentId);
    }
    selectedAgentIds.value = existingCPs;

    branchId.value = props.lead.branchId || '';
    reason.value = '';
    reasonError.value = '';
    agentRemarks.value = '';
    transferType.value = existingCPs.length > 0 ? 'agent' : 'user';
  }
};

onMounted(populateForm);
watch(() => props.lead, populateForm);

const handleAgentCreated = (newAgent) => {
  if (newAgent?._id && !selectedAgentIds.value.includes(newAgent._id)) {
    selectedAgentIds.value.push(newAgent._id);
  }
};

const { mutateAsync: assignOwner, isPending: assignPending } = useAssignLeadMutation();
const { mutateAsync: updateLead, isPending: updatePending } = useUpdateLeadMutation();
const { mutateAsync: transferAgent, isPending: transferAgentPending } = useTransferLeadToAgentMutation();

const isPending = computed(() => assignPending.value || updatePending.value || transferAgentPending.value);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const onTransfer = async () => {
  reasonError.value = '';
  const leadId = props.lead._id || props.lead.id;

  try {
    if (transferType.value === 'agent') {
      if (selectedAgentIds.value.length === 0) {
        Swal.fire({ text: 'Please select at least one Channel Partner / Agent to transfer lead', icon: 'error' });
        return;
      }

      await transferAgent({
        leadId,
        agentIds: selectedAgentIds.value,
        remarks: agentRemarks.value,
      });
    } else {
      if (ownerChanged.value && !reason.value.trim()) {
        reasonError.value = 'Transfer reason is required when reassigning owner agent.';
        return;
      }

      if (ownerChanged.value) {
        await assignOwner({
          id: leadId,
          assignedTo: assignedTo.value || undefined,
          reason: reason.value
        });
      }
    }

    // Update branch location if changed
    if (branchId.value !== props.lead.branchId) {
      await updateLead({
        id: leadId,
        branchId: branchId.value || undefined,
      });
    }

    store.dispatch('notifications/triggerToast', {
      message: 'Lead transferred successfully to selected Channel Partners.',
      type: 'success'
    });
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.error?.message || error.message || 'Transfer failed.',
      type: 'error'
    });
  }
};
</script>

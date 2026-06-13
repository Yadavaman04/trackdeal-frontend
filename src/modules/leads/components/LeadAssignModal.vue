<template>
  <AppModal
    :isOpen="isOpen"
    :title="isBulk ? 'Bulk Assign Owner Agent' : 'Assign Owner Agent'"
    maxSize="440px"
    @cancel="$emit('close')"
    @confirm="handleConfirm"
  >
    <div class="space-y-4 text-xs">
      <div class="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-3 text-indigo-800 dark:text-indigo-400">
        <p class="text-[10px] leading-relaxed">
          <span v-if="isBulk">You are bulk reassigning <b>{{ leadIds.length }} leads</b>.</span>
          <span v-else>You are reassigning this lead's primary owner agent.</span>
          This updates the agent dashboard assignments and sends notification alerts.
        </p>
      </div>

      <!-- Select Agent dropdown -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select New Owner Agent *</label>
        <select 
          v-model="assignedTo" 
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.assignedTo ? 'border-red-500' : 'border-default'"
        >
          <option value="">Select Agent</option>
          <option value="user-david">David Miller (Agent)</option>
          <option value="user-sonia">Sonia Rao (Agent)</option>
          <option value="user-ravi">Ravi Verma (Team Leader)</option>
        </select>
        <span v-if="errors.assignedTo" class="text-[9px] text-red-500 mt-1 block">{{ errors.assignedTo }}</span>
      </div>

      <!-- Assignment Reason input -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assignment Reason *</label>
        <input 
          v-model="reason" 
          type="text" 
          placeholder="e.g. Allocation re-balancing, lead rotation..."
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.reason ? 'border-red-500' : 'border-default'"
        />
        <span v-if="errors.reason" class="text-[9px] text-red-500 mt-1 block">{{ errors.reason }}</span>
      </div>
    </div>

    <!-- Actions slot overriding standard modal buttons to show loading state -->
    <template #footer>
      <button 
        @click="$emit('close')" 
        class="px-3.5 py-2 border border-default text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
      >
        Cancel
      </button>
      <button 
        @click="handleConfirm"
        :disabled="isPending"
        class="px-3.5 py-2 text-xs font-semibold text-white bg-primary rounded-lg disabled:bg-slate-350 transition-colors flex items-center justify-center min-w-[90px]"
      >
        <span v-if="isPending">Assigning...</span>
        <span v-else>Confirm Assignment</span>
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue';
import { useStore } from 'vuex';
import AppModal from '@/components/AppModal.vue';
import { useAssignLeadMutation, useBulkAssignLeadsMutation } from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  leadIds: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'success']);

const store = useStore();
const assignedTo = ref('');
const reason = ref('');
const errors = reactive({
  assignedTo: '',
  reason: ''
});

const isBulk = computed(() => props.leadIds.length > 1);

const { mutateAsync: assignOwner, isPending: assignPending } = useAssignLeadMutation();
const { mutateAsync: bulkAssign, isPending: bulkPending } = useBulkAssignLeadsMutation();

const isPending = computed(() => assignPending.value || bulkPending.value);

watch(() => props.isOpen, () => {
  if (props.isOpen) {
    assignedTo.value = '';
    reason.value = '';
    errors.assignedTo = '';
    errors.reason = '';
  }
});

const handleConfirm = async () => {
  errors.assignedTo = '';
  errors.reason = '';
  let valid = true;

  if (!assignedTo.value) {
    errors.assignedTo = 'Agent selection is required.';
    valid = false;
  }
  if (!reason.value.trim()) {
    errors.reason = 'Assignment reason explanation is required.';
    valid = false;
  }

  if (!valid) return;

  try {
    if (isBulk.value) {
      await bulkAssign({
        leadIds: props.leadIds,
        assignedTo: assignedTo.value,
        reason: reason.value
      });
    } else {
      await assignOwner({
        id: props.leadIds[0],
        assignedTo: assignedTo.value,
        reason: reason.value
      });
    }

    store.dispatch('notifications/triggerToast', {
      message: 'Owner agent reassigned successfully.',
      type: 'success'
    });
    
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Assignment update failed.',
      type: 'error'
    });
  }
};
</script>

<template>
  <AppModal
    :isOpen="isOpen"
    title="Mark Lead as Lost"
    maxSize="460px"
    :isDestructive="true"
    @cancel="$emit('close')"
    @confirm="handleConfirm"
  >
    <div class="space-y-3.5 text-xs">
      <div class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-3 text-red-800 dark:text-red-400">
        <p class="text-[11px] leading-relaxed">
          You are marking this lead as <b>Lost</b>. Please specify the reason. This will move the lead out of the active sales pipeline.
        </p>
      </div>

      <!-- Select Dropdown for Loss Reason -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Loss Reason *</label>
        <select 
          v-model="lostReason" 
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-red-500"
          :class="errors.lostReason ? 'border-red-500' : 'border-default'"
        >
          <option value="">Select Loss Reason</option>
          <option value="wrong_number">Wrong Phone Number / Spam</option>
          <option value="invalid_requirement">Invalid Requirements</option>
          <option value="bought_elsewhere">Bought Elsewhere / Another Broker</option>
          <option value="budget_issue">Budget Constraints</option>
          <option value="out_of_area">Out of Target Area</option>
          <option value="no_response">No Response / Unresponsive</option>
          <option value="other">Other / Custom Notes</option>
        </select>
        <span v-if="errors.lostReason" class="text-[9px] text-red-500 mt-1 block">{{ errors.lostReason }}</span>
      </div>

      <!-- Textarea for Loss Notes (Enforced min 10 characters by backend service) -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Detailed Explanation Notes * (Min 10 characters)</label>
        <textarea 
          v-model="lostNotes" 
          rows="3"
          placeholder="Describe why the client dropped off, what properties they bought instead, or why they defaulted..."
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-red-500 resize-none"
          :class="errors.lostNotes ? 'border-red-500' : 'border-default'"
        ></textarea>
        <span v-if="errors.lostNotes" class="text-[9px] text-red-500 mt-1 block">{{ errors.lostNotes }}</span>
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
        class="px-3.5 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-650 rounded-lg disabled:bg-slate-350 transition-colors flex items-center justify-center min-w-[90px]"
      >
        <span v-if="isPending">Marking Lost...</span>
        <span v-else>Confirm Lost</span>
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useStore } from 'vuex';
import AppModal from '@/components/AppModal.vue';
import { useChangeLeadStageMutation } from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  leadId: { type: String, required: true }
});

const emit = defineEmits(['close', 'success']);

const store = useStore();
const lostReason = ref('');
const lostNotes = ref('');
const errors = reactive({
  lostReason: '',
  lostNotes: ''
});

const { mutateAsync: changeStage, isPending } = useChangeLeadStageMutation();

const handleConfirm = async () => {
  errors.lostReason = '';
  errors.lostNotes = '';
  let valid = true;

  if (!lostReason.value) {
    errors.lostReason = 'Loss reason selection is required.';
    valid = false;
  }
  if (!lostNotes.value || lostNotes.value.trim().length < 10) {
    errors.lostNotes = 'Explanation notes must contain at least 10 characters.';
    valid = false;
  }

  if (!valid) return;

  try {
    await changeStage({
      id: props.leadId,
      status: 'lost',
      lostReason: lostReason.value,
      lostNotes: lostNotes.value
    });

    store.dispatch('notifications/triggerToast', {
      message: 'Lead stage changed to lost.',
      type: 'success'
    });
    
    // Clear forms
    lostReason.value = '';
    lostNotes.value = '';
    
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to transition stage.',
      type: 'error'
    });
  }
};
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <div class="bg-surface border border-default w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col animate-fade-in text-xs">
      <!-- Header -->
      <div class="px-4 py-3 border-b border-default flex justify-between items-center bg-slate-50 dark:bg-slate-900 shrink-0">
        <h3 class="font-heading font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <PhLockOpen :size="14" class="text-red-500" />
          <span>Confirm Hold Release</span>
        </h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors">
          <PhX :size="14" />
        </button>
      </div>

      <!-- Form Content -->
      <div class="p-4 space-y-4">
        <p class="text-slate-550 leading-relaxed text-[11px]">
          Are you sure you want to release the active reservation hold on this property? This will make the unit instantly <b>Available</b> in the public directory and waitlist Rollovers.
        </p>

        <!-- Justification notes -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Release Justification *</label>
          <textarea 
            v-model="justification" 
            rows="2"
            placeholder="Specify reason for release (e.g. Client cancelled, hold expired, waitlist shift)..."
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary resize-none"
          ></textarea>
        </div>

        <!-- Token Refund Prompt -->
        <div v-if="tokenPaid > 0" class="bg-amber-50 dark:bg-amber-950/20 border border-amber-250 p-3 rounded-lg space-y-2">
          <label class="block text-[10px] font-bold text-amber-700 dark:text-amber-450 uppercase">Token Refund Status *</label>
          <p class="text-[9px] text-amber-600 dark:text-amber-450">
            A token amount of <b>{{ formatCurrency(tokenPaid) }}</b> was paid. Choose refund action:
          </p>
          <select 
            v-model="refundStatus" 
            class="w-full bg-surface border border-amber-300 rounded px-2 py-1 outline-none text-[10px] font-semibold text-slate-800"
          >
            <option value="initiated">Initiate Refund (Standard 7-day gateway process)</option>
            <option value="forfeited">Forfeit Token (Non-refundable terms agreement violation)</option>
            <option value="not_applicable">No Refund Required</option>
          </select>
        </div>
        
        <span v-if="error" class="text-[9px] text-red-500 block font-bold">{{ error }}</span>
      </div>

      <!-- Actions -->
      <div class="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-default flex justify-end space-x-2 shrink-0">
        <button 
          @click="$emit('close')" 
          class="btn-md btn-secondary"
        >
          Cancel
        </button>
        <button 
          @click="onSubmit"
          :disabled="isPending || !justification.trim()"
          class="btn-md btn-danger"
        >
          Confirm Release
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/api/client';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  property: { type: Object, default: null },
  tokenPaid: { type: Number, default: 0 }
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const justification = ref('');
const refundStatus = ref('initiated');
const error = ref('');
const isPending = ref(false);

const onSubmit = async () => {
  if (!justification.value.trim()) {
    error.value = 'Release justification reason is required';
    return;
  }

  isPending.value = true;
  error.value = '';
  const propId = props.property._id || props.property.id;
  const isUnit = !!props.property.unitNumber;

  try {
    if (isUnit) {
      await apiClient.post(`/projects/units/${propId}/release`, {
        reason: justification.value,
        refundStatus: refundStatus.value
      });
    } else {
      await apiClient.post(`/properties/${propId}/release`, {
        reason: justification.value,
        refundStatus: refundStatus.value
      });
    }

    store.dispatch('notifications/triggerToast', {
      message: 'Property hold successfully released.',
      type: 'success'
    });

    justification.value = '';
    emit('success');
    emit('close');
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: err.response?.data?.message || 'Failed to release reservation.',
      type: 'error'
    });
  } finally {
    isPending.value = false;
  }
};

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};
</script>

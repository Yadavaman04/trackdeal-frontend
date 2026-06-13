<template>
  <div class="bg-surface border border-default rounded-xl p-4 shadow-sm text-xs space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-default pb-2">
      <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
        Clawback & Recovery Management
      </h4>
      <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-red-50 text-red-655 border border-red-250">
        Active Exposure
      </span>
    </div>

    <!-- Metrics -->
    <div class="grid grid-cols-3 gap-2 text-center font-bold">
      <div class="bg-slate-50 dark:bg-slate-900 border border-default p-2 rounded-lg">
        <span class="text-slate-400 block text-[8px] uppercase">Original Comm.</span>
        <span class="text-slate-800 dark:text-slate-200 text-[10px] block mt-0.5">
          {{ formatCurrency(clawback.originalCommission) }}
        </span>
      </div>
      <div class="bg-slate-50 dark:bg-slate-900 border border-default p-2 rounded-lg">
        <span class="text-slate-400 block text-[8px] uppercase">Recovered</span>
        <span class="text-emerald-600 text-[10px] block mt-0.5">
          {{ formatCurrency(clawback.recoveredAmount) }}
        </span>
      </div>
      <div class="bg-red-50/20 dark:bg-red-950/10 border border-red-100 p-2 rounded-lg">
        <span class="text-red-655 block text-[8px] uppercase">Outstanding</span>
        <span class="text-red-655 text-[10px] block mt-0.5">
          {{ formatCurrency(clawback.outstandingRecovery) }}
        </span>
      </div>
    </div>

    <!-- Recovery Log Actions -->
    <div class="space-y-2.5">
      <h5 class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Clawback Transactions</h5>
      
      <div class="space-y-2 font-medium">
        <div 
          v-for="item in clawback.logs" 
          :key="item.id"
          class="p-2.5 rounded-lg border border-default bg-slate-50/30 dark:bg-slate-900/40 flex justify-between items-center text-[10px]"
        >
          <div>
            <p class="font-bold text-slate-800 dark:text-slate-200 capitalize">{{ item.type.replace('_', ' ') }}</p>
            <p class="text-[9px] text-slate-400 mt-0.5">Ref: {{ item.referenceNumber }} | Date: {{ formatDate(item.createdAt) }}</p>
          </div>
          <div class="text-right">
            <span class="font-bold text-red-550 block">{{ formatCurrency(item.amount) }}</span>
            <span class="text-[8px] bg-red-50 text-red-600 px-1 py-0.2 rounded font-bold uppercase">{{ item.status }}</span>
          </div>
        </div>

        <div v-if="clawback.logs?.length === 0" class="text-center py-6 text-slate-400 italic">No clawback transactions logged.</div>
      </div>
    </div>

    <!-- Action Trigger buttons -->
    <div class="flex justify-end pt-1" v-if="clawback.outstandingRecovery > 0">
      <button 
        @click="$emit('triggerRecovery')"
        class="btn btn-sm btn-danger text-[10px] h-7 px-2.5"
      >
        <PhCoins :size="13" />
        <span>Trigger Recovery Process</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { PhCoins } from '@phosphor-icons/vue';

const props = defineProps({
  clawback: {
    type: Object,
    default: () => ({
      originalCommission: 540000,
      recoveredAmount: 180000,
      outstandingRecovery: 360000,
      logs: [
        { id: 'cl-1', type: 'deal_cancellation', referenceNumber: 'CL-98420', amount: 360000, status: 'pending', createdAt: '2026-06-03T10:00:00Z' },
        { id: 'cl-2', type: 'builder_chargeback', referenceNumber: 'CL-98421', amount: 180000, status: 'recovered', createdAt: '2026-06-01T11:00:00Z' }
      ]
    })
  }
});

const emit = defineEmits(['triggerRecovery']);

const formatDate = (val) => {
  if (!val) return '';
  return new Date(val).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
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
